'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonationWidget() {
  return (
    <Elements stripe={stripePromise}>
      <DonationForm />
    </Elements>
  );
}

const presetAmounts = [3, 5, 10];

function DonationForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number | null>(presetAmounts[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const selectAmount = (amt: number) => {
    setAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setAmount(null);
  };

  const getAmount = () => {
    if (amount !== null) return amount;
    const parsed = parseFloat(customAmount);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet.');
      setIsLoading(false);
      return;
    }

    const chosenAmount = getAmount();
    if (chosenAmount <= 0) {
      setError('Please select a valid amount.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(chosenAmount * 100),
          donorEmail: email || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment initialization failed');

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const paymentResult = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email: email || undefined },
        },
      });

      if (paymentResult.error) throw new Error(paymentResult.error.message);

      if (paymentResult.paymentIntent?.status === 'succeeded') {
        setSuccess('Thank you for your donation!');
        setEmail('');
        setAmount(presetAmounts[0]);
        setCustomAmount('');
        cardElement.clear();
      } else {
        throw new Error('Payment was not successful.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="text-xl font-semibold text-[color:var(--ow-neutral-900)] text-center">Support WriterRank</h3>

      <div className="flex flex-wrap gap-2 justify-center">
        {presetAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => selectAmount(amt)}
            className={`px-4 py-2 rounded-md border transition-colors flex-1 sm:flex-none ${
              amount === amt
                ? 'bg-[color:var(--ow-orange-500)] text-white border-transparent'
                : 'bg-white text-[color:var(--ow-neutral-900)] border-gray-300'
            }`}
          >
            ${amt}
          </button>
        ))}
        <input
          type="number"
          min="1"
          placeholder="Custom"
          value={customAmount}
          onChange={handleCustomChange}
          className="w-24 px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />

      <div className="p-3 border border-gray-300 rounded-md bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#111827',
                '::placeholder': { color: '#9CA3AF' },
              },
            },
          }}
        />
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      {success && <p className="text-sm text-green-600 text-center">{success}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-[color:var(--ow-orange-500)] text-white font-semibold rounded-md hover:bg-[color:var(--ow-orange-500)]/90 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Donate'}
      </button>
    </form>
  );
}

