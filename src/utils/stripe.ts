import { loadStripe, Stripe } from '@stripe/stripe-js';
import { loadSettings } from './settings';

let stripe: Stripe | null = null;

// Initialize Stripe
export const initializeStripe = async (): Promise<Stripe | null> => {
  if (stripe) return stripe;
  
  try {
    const settings = await loadSettings();
    if (!settings) {
      console.warn('Failed to load settings');
      return null;
    }
    
    const publishableKey = settings.payment.stripePublishableKey;
    
    if (!publishableKey) {
      console.warn('Stripe publishable key not configured');
      return null;
    }
    
    stripe = await loadStripe(publishableKey);
    return stripe;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return null;
  }
};

// Create payment intent via backend
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const response = await fetch('http://localhost:3004/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Process payment using Stripe Elements
export const processPayment = async (
  paymentMethod: any, 
  amount: number, 
  currency: string = 'usd'
) => {
  try {
    const stripeInstance = await initializeStripe();
    if (!stripeInstance) {
      throw new Error('Stripe not initialized');
    }

    // Create payment intent
    const { clientSecret, paymentIntentId } = await createPaymentIntent(amount, currency);
    
    // Confirm the payment with Stripe
    const { error, paymentIntent } = await stripeInstance.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (error) {
      throw new Error(error.message || 'Payment failed');
    }

    if (paymentIntent.status === 'succeeded') {
      // Verify payment with backend
      const verifyResponse = await fetch('http://localhost:3004/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyResult = await verifyResponse.json();
      if (!verifyResult.success) {
        throw new Error('Payment not confirmed');
      }

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_method: paymentMethod.id,
        created: paymentIntent.created,
      };
    } else {
      throw new Error(`Payment status: ${paymentIntent.status}`);
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

// Get Stripe instance
export const getStripe = (): Stripe | null => stripe;

// Check if Stripe is configured
export const isStripeConfigured = async (): Promise<boolean> => {
  try {
    const settings = await loadSettings();
    if (!settings) {
      return false;
    }
    return !!(settings.payment.stripePublishableKey && settings.payment.stripeSecretKey);
  } catch (error) {
    console.error('Error checking Stripe configuration:', error);
    return false;
  }
};
