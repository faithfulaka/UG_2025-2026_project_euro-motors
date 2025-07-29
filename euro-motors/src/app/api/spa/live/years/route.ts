import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Type for the response
interface YearsResponse {
  years: string[];
  sources: string[];
  errors?: string[];
  timestamp: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  const sources: string[] = [];
  const errors: string[] = [];
  let allYears: string[] = [];

  if (!make || !model) return NextResponse.json({ years: [] });

  // 1. CarQuery API
  try {
    // CarQuery getTrims returns trims with year info
    const carQueryResp = await axios.get(`https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
    const data = carQueryResp.data;
    interface CarQueryTrim {
  year: number;
  [key: string]: unknown;
}


let years: string[] = [];
    if (typeof data === 'string') {
      const json = JSON.parse(data.replace(/^\?\((.*)\);?$/, '$1'));
      years = (json.Trims as CarQueryTrim[] || []).map((t) => String(t.year)).filter(Boolean);
    } else if (data.Trims) {
      years = (data.Trims as CarQueryTrim[]).map((t) => String(t.year)).filter(Boolean);
    }
    if (years.length > 0) {
      allYears = allYears.concat(years);
      sources.push('CarQueryAPI');
    }
  } catch (err) {
    errors.push('CarQueryAPI: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 2. NHTSA API
  try {
    // NHTSA does not provide years directly, but does provide models for a make/year
    // We'll try to get years for which the model exists (iterate recent years)
    const currentYear = new Date().getFullYear();
    const yearsToCheck = Array.from({ length: 30 }, (_, i) => currentYear - i); // last 30 years
    const foundYears: string[] = [];
    for (const year of yearsToCheck) {
      try {
        const nhtsaResp = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`);
        // NHTSA API types
interface NHTSAModelYear {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}
const models = (nhtsaResp.data.Results as NHTSAModelYear[] || []).map((m) => m.Model_Name?.toLowerCase());
        if (models.includes(model.toLowerCase())) {
          foundYears.push(String(year));
        }
      } catch {}
    }
    if (foundYears.length > 0) {
      allYears = allYears.concat(foundYears);
      sources.push('NHTSA');
    }
  } catch (err) {
    errors.push('NHTSA: ' + (err instanceof Error ? err.message : String(err)));
  }

  // Deduplicate and sort descending
  allYears = Array.from(new Set(allYears.map(y => (y || '').trim()).filter(Boolean)));
  allYears.sort((a, b) => parseInt(b) - parseInt(a));

  // If no years found, return error
  if (allYears.length === 0) {
    return NextResponse.json({
      years: [],
      sources,
      errors: errors.length ? errors : ['No years found from any API'],
      timestamp: new Date().toISOString()
    } as YearsResponse, { status: 502 });
  }

  return NextResponse.json({
    years: allYears,
    sources,
    errors: errors.length ? errors : undefined,
    timestamp: new Date().toISOString()
  } as YearsResponse);
}
