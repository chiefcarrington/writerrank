// src/app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { getAuth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { amount, donorEmail } = await req.json();

    // Validate amount (in cents) to be between $1 and $100
    if (typeof amount !== 'number' || amount < 100 || amount > 10000) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 },
      );
    }

    const { userId } = getAuth(req);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        donor_email: donorEmail || '',
        clerk_id: userId || '',
      },
    });

    const supabase = createClient();
    const { error } = await supabase.from('donations').insert({
      stripe_payment_intent_id: paymentIntent.id,
      amount,
      donor_email: donorEmail,
      clerk_id: userId,
      status: 'pending',
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 },
      );
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment creation failed:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}

