import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/settings';
import { isStripeConfigured } from '../utils/stripe';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

// Inner payment form component that uses Stripe hooks
const PaymentFormInner: React.FC<PaymentFormProps> = ({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!stripe || !elements) {
      newErrors.general = 'Stripe not initialized';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!stripe || !elements) {
      onPaymentError('Stripe not initialized');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create payment method from card element
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (error) {
        throw new Error(error.message || 'Payment method creation failed');
      }

      // Process the payment
      const { processPayment } = await import('../utils/stripe');
      const paymentResult = await processPayment(paymentMethod, amount);
      
      onPaymentSuccess(paymentResult);
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          <p className="text-sm text-gray-600">Complete your order securely</p>
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className={`border rounded-md p-3 ${
              errors.card ? 'border-red-300' : 'border-gray-300'
            }`}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#374151',
                      '::placeholder': {
                        color: '#9CA3AF',
                      },
                    },
                  },
                }}
              />
            </div>
            {errors.card && (
              <p className="mt-1 text-sm text-red-600">{errors.card}</p>
            )}
          </div>

          {/* General Errors */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !stripe}
            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
              isProcessing || !stripe
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <CheckCircle className="h-4 w-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main payment form component that handles Stripe initialization
const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const configured = await isStripeConfigured();
        setStripeConfigured(configured);
        
        if (configured) {
          // Load settings to get the publishable key
          const { loadSettings } = await import('../utils/settings');
          const settings = await loadSettings();
          
          if (settings?.payment?.stripePublishableKey) {
            const stripe = await loadStripe(settings.payment.stripePublishableKey);
            setStripePromise(stripe);
          }
        }
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        setStripeConfigured(false);
      } finally {
        setLoading(false);
      }
    };
    
    initializeStripe();
  }, []);

  // Show loading state while checking Stripe configuration
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking payment configuration...</p>
      </div>
    );
  }

  if (!stripeConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Payment Not Configured
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Stripe payment gateway is not configured. Please contact the administrator.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={props.onCancel}
            className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Payment Error
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Failed to initialize payment system. Please try again or contact support.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={props.onCancel}
            className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
};

export default PaymentForm;
