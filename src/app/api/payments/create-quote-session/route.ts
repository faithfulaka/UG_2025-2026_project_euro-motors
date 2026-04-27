// src/app/api/payments/create-quote-session/route.ts
// Creates a Stripe checkout session for an already-created quote or trade-in.
// Does NOT create new DB records — the quote/trade-in already exists.

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    verifyToken(cookieToken);

    const {
      amount,        // amount in GBP (e.g. 4000)
      description,   // e.g. "Bentley Bentayga V8 - Direct Purchase"
      quoteId,       // existing quote ID to reference in metadata
    }: { amount: number; description: string; quoteId?: string } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_AMOUNT', message: 'Valid amount is required' } },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: description },
            unit_amount: Math.round(amount * 100), // convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: {
        quoteId: quoteId || '',
        type: 'buy',
      },
    });

    return NextResponse.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Create quote session error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SESSION_ERROR', message: 'Failed to create payment session' } },
      { status: 500 }
    );
  }
}
