// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Disable body parsing — Stripe needs the raw body to verify the signature
export const config = { api: { bodyParser: false } };

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Handle cart-based checkout (rentals + quotes created before session)
    if (session.metadata?.recordIds) {
      const recordIds: { type: string; id: string }[] = JSON.parse(session.metadata.recordIds);
      for (const record of recordIds) {
        if (record.type === 'rental') {
          await prisma.rental.update({
            where: { id: record.id },
            data: {
              paymentStatus: 'PAID',
              rentalStatus: 'PAID',
              stripeSessionId: session.id,
              stripePaymentIntentId:
                typeof session.payment_intent === 'string' ? session.payment_intent : null,
              paymentMethod: 'card',
            },
          });
        } else if (record.type === 'quote') {
          await prisma.quote.update({
            where: { id: record.id },
            data: { quoteStatus: 'GENERATED' },
          });
        }
      }
    }

    // Handle buy/trade-in checkout (quote already created before session)
    if (session.metadata?.quoteId && session.metadata?.type === 'buy') {
      await prisma.quote.update({
        where: { id: session.metadata.quoteId },
        data: { quoteStatus: 'GENERATED' },
      });
    }
  }

  return NextResponse.json({ received: true });
}
