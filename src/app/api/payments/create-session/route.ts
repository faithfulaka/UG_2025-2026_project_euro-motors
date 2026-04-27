// src/app/api/payments/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface CartItem {
  id: string;
  type: 'buy' | 'rent';
  carId: string;
  carMake: string;
  carModel: string;
  carYear: number;
  price: number;
  quantity: number;
  rentalDates?: {
    startDate: string;
    endDate: string;
    duration: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('token')?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const decoded = verifyToken(cookieToken);
    const { cartItems }: { cartItems: CartItem[] } = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'EMPTY_CART', message: 'Cart is empty' } },
        { status: 400 }
      );
    }

    // Create Rental/Quote records in DB with PENDING status before Stripe session
    const createdRecordIds: { type: string; id: string }[] = [];

    for (const item of cartItems) {
      if (item.type === 'rent' && item.rentalDates) {
        const rental = await prisma.rental.create({
          data: {
            userId: decoded.userId,
            carId: item.carId,
            startDate: new Date(item.rentalDates.startDate),
            endDate: new Date(item.rentalDates.endDate),
            rentalDuration: item.rentalDates.duration as 'HOURLY' | 'DAILY' | 'WEEKLY',
            totalAmount: item.price,
            paymentStatus: 'PENDING',
            rentalStatus: 'RESERVED',
          },
        });
        createdRecordIds.push({ type: 'rental', id: rental.id });
      } else if (item.type === 'buy') {
        const quote = await prisma.quote.create({
          data: {
            userId: decoded.userId,
            carId: item.carId,
            amount: item.price,
            quoteStatus: 'PENDING',
          },
        });
        createdRecordIds.push({ type: 'quote', id: quote.id });
      }
    }

    // Build Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: `${item.carMake} ${item.carModel} (${item.carYear})`,
          description:
            item.type === 'rent' && item.rentalDates
              ? `Rental: ${item.rentalDates.duration} — ${new Date(item.rentalDates.startDate).toLocaleDateString('en-GB')} to ${new Date(item.rentalDates.endDate).toLocaleDateString('en-GB')}`
              : 'Purchase Enquiry',
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses pence
      },
      quantity: item.quantity,
    }));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      metadata: {
        userId: decoded.userId,
        recordIds: JSON.stringify(createdRecordIds),
      },
    });

    return NextResponse.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SESSION_ERROR', message: 'Failed to create payment session' } },
      { status: 500 }
    );
  }
}
