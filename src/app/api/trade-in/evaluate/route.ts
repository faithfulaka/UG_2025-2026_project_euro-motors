// src/app/api/trade-in/evaluate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * POST /api/trade-in/evaluate
 * Uses OpenAI to intelligently evaluate trade-in vehicle value
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or header
    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    const body = await request.json();
    const {
      targetPrice,
      make,
      model,
      year,
      mileage,
      condition,
      accidentHistory,
      numberOfAccidents,
      previousOwners,
      fullServiceHistory,
      hasModifications,
      interiorCondition,
      exteriorCondition,
      fuelType,
      colour,
      lastPrice,
      previousCondition,
      previousMileage,
      previousAccidents
    } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'OpenAI API not configured'
          }
        },
        { status: 500 }
      );
    }

    const currentYear = new Date().getFullYear();
    const age = year ? currentYear - year : 0;

    const previousContext = lastPrice ? `
PREVIOUS VALUATION CONTEXT:
- Last Estimated Price: £${lastPrice}
- Previous Condition: ${previousCondition || 'Unknown'}
- Previous Mileage: ${previousMileage || 'Unknown'} miles
- Previous Accidents: ${previousAccidents}

ANALYZE THE CHANGE: Compare the new data to the previous. 
- If mileage INCREASED, price should go DOWN
- If condition IMPROVED, price should go UP
- If accidents INCREASED, price should go DOWN significantly
- If mileage DECREASED, price should go UP
Explain what changed and why the price is different.
` : '';

    const prompt = `You are an expert vehicle valuation specialist. Your job is to REDUCE the value based on negative factors.

Vehicle Details:
- Make: ${make || 'Unknown'}
- Model: ${model || 'Unknown'}
- Year: ${year || 'Unknown'}
- Age: ${age} years
- Mileage: ${mileage || 0} miles
- Condition: ${condition || 'Unknown'} (excellent > good > fair > poor)
- Fuel Type: ${fuelType || 'Unknown'}
- Colour: ${colour || 'Unknown'}
- Previous Owners: ${previousOwners || 'Unknown'}
- Full Service History: ${fullServiceHistory ? 'Yes' : 'No'}
- Modifications: ${hasModifications ? 'Yes - REDUCES VALUE' : 'No'}
- Accident History: ${accidentHistory ? `Yes, ${numberOfAccidents || 0} accidents - MAJOR VALUE REDUCTION` : 'No'}
- Interior Condition (1-5): ${interiorCondition || 'Not rated'} (5=excellent, 1=poor)
- Exterior Condition (1-5): ${exteriorCondition || 'Not rated'} (5=excellent, 1=poor)

Target vehicle price (car they want to buy): £${targetPrice}

${previousContext}

VALUATION RULES - YOU MUST FOLLOW THESE:

STEP 1: CHECK YEAR FIRST (PRIMARY FACTOR):
- This is the MOST IMPORTANT factor
- 2026 car: NO deduction (newest)
- 2025 car: -5% deduction
- 2024 car: -10% deduction
- 2023 car: -15% deduction
- 2022 car: -20% deduction
- 2020 car: -30% deduction
- 2015 car: -55% deduction
- 2010 car: -80% deduction
- 1990 car: -160% deduction (massively reduced)

STEP 2: START with 60% of target price (£${Math.round(targetPrice * 0.6)}) as base, THEN apply year deduction FIRST

STEP 3: Then DEDUCT for OTHER negative factors:
   - HIGH MILEAGE: Every 50,000 miles = -3% (${mileage} miles = ${Math.round((mileage / 50000) * 3)}% deduction)
   - PREVIOUS OWNERS: More than 1 owner = -5% per additional owner (${previousOwners} owners = ${Math.max(0, (previousOwners - 1) * 5)}% deduction)
   - MODIFICATIONS: -10% (you have modifications)
   - ACCIDENTS: ${numberOfAccidents === 0 ? 'No deduction' : numberOfAccidents === 1 ? '-15% (1 accident)' : numberOfAccidents === 2 ? '-30% (2 accidents)' : '-60% (3+ accidents)'}
   - CONDITION: ${condition === 'excellent' ? 'No deduction' : condition === 'good' ? '-5%' : condition === 'fair' ? '-12%' : '-25%'} (condition: ${condition})
   - INTERIOR/EXTERIOR: Each point below 5 = -2% (Interior: ${interiorCondition}, Exterior: ${exteriorCondition})
   - NO service history = -3%

4. Apply deductions in this ORDER: Year FIRST, then others
5. FINAL VALUE must NOT exceed £${targetPrice}
6. FINAL VALUE must be at least £500

REMEMBER: Newer cars are ALWAYS worth more. A 2015 car MUST be valued higher than a 1990 car with same mileage and condition.

Respond ONLY with valid JSON in this format:
{
  "estimatedValue": <number between 500 and ${targetPrice}>,
  "baseValue": ${Math.round(targetPrice * 0.6)},
  "deductions": {
    "mileageDeduction": <percentage number>,
    "ageDeduction": <percentage number>,
    "ownersDeduction": <percentage number>,
    "modificationDeduction": <percentage number>,
    "accidentDeduction": <percentage number>,
    "conditionDeduction": <percentage number>,
    "interiorExteriorDeduction": <percentage number>,
    "serviceHistoryDeduction": <percentage number>
  },
  "totalDeductionPercent": <total percentage deducted>,
  "reasoning": "<concise explanation of final value>"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert vehicle valuation specialist. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'OPENAI_ERROR',
            message: errorData.error?.message || 'Failed to evaluate vehicle'
          }
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response from OpenAI
    const valuation = JSON.parse(content);

    // Ensure value doesn't exceed target price
    let finalValue = Math.min(valuation.estimatedValue, targetPrice);

    // HARD CAP: Pre-current-year cars can NEVER have a trade-in value exceeding a year-based cap
    // This ensures a 2015 car is never valued more than the car being purchased
    if (year && year < currentYear) {
      const capPercent = Math.max(10, 90 - age * 10); // 2025=85%, 2024=70%, 2023=60%, etc.
      const yearCap = targetPrice * (capPercent / 100);
      finalValue = Math.min(finalValue, yearCap);
    }

    return NextResponse.json({
      success: true,
      data: {
        estimatedValue: Math.round(finalValue),
        reasoning: valuation.reasoning,
        baseValue: valuation.baseValue,
        deductions: valuation.deductions,
        totalDeductionPercent: valuation.totalDeductionPercent,
        maxAllowedValue: targetPrice
      }
    });
  } catch (error) {
    console.error('[TRADE-IN EVALUATE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to evaluate trade-in vehicle'
        }
      },
      { status: 500 }
    );
  }
}
