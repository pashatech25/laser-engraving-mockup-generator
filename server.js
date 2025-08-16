import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Note: Twilio client will be initialized dynamically when SMS is enabled
// This makes the system production-ready and secure

// Middleware
app.use(cors());
app.use(express.json());

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, fromEmail, resendApiKey } = req.body;

    // Validate required fields
    if (!to || !subject || !html || !text || !fromEmail || !resendApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, html, text, fromEmail, resendApiKey'
      });
    }

    // Validate Resend API key format
    if (!resendApiKey.startsWith('re_')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Resend API key format. Should start with "re_"'
      });
    }

    console.log('Sending email via Resend:', {
      from: fromEmail,
      to: to,
      subject: subject,
      hasHtml: !!html,
      hasText: !!text
    });

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        error: 'Resend API error',
        details: errorData
      });
    }

    const result = await response.json();
    console.log('Email sent successfully via Resend:', result);
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Server error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Send SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message, fromPhone } = req.body;
    
    if (!to || !message || !fromPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, message, fromPhone' 
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number format' 
      });
    }

    // Load SMS settings from database
    // Note: In a real production app, you'd have a database connection here
    // For now, we'll simulate the database check with environment variables
    // In production, this should query your Supabase database
    
    // TODO: Replace this with actual database query
    // const smsSettings = await queryDatabase('SELECT * FROM sms_settings WHERE id = 1');
    
    // For now, we'll check if the request includes the SMS settings
    // This is a temporary workaround until we implement proper database integration
    const { smsEnabled, twilioAccountSid, twilioAuthToken } = req.body;
    
    if (!smsEnabled) {
      return res.status(503).json({ 
        success: false, 
        error: 'SMS service is disabled. Please enable SMS in the admin panel.' 
      });
    }

    if (!twilioAccountSid || !twilioAuthToken) {
      return res.status(503).json({ 
        success: false, 
        error: 'SMS credentials not configured. Please configure Twilio in the admin panel.' 
      });
    }

    console.log('Sending SMS via Twilio:', {
      from: fromPhone,
      to,
      messageLength: message.length
    });

    // Initialize Twilio client dynamically
    const twilio = await import('twilio');
    const twilioClient = twilio.default(twilioAccountSid, twilioAuthToken);

    // Send SMS via Twilio
    const smsResult = await twilioClient.messages.create({
      body: message,
      from: fromPhone,
      to: to
    });

    console.log('SMS sent successfully via Twilio:', {
      sid: smsResult.sid,
      status: smsResult.status,
      to: smsResult.to
    });

    res.json({ 
      success: true, 
      message: 'SMS sent successfully', 
      data: {
        sid: smsResult.sid,
        status: smsResult.status,
        to: smsResult.to
      }
    });
  } catch (error) {
    console.error('Server error sending SMS:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number' 
      });
    } else if (error.code === 21608) {
      res.status(400).json({ 
        success: false, 
        error: 'Phone number not verified' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send SMS',
        message: error.message 
      });
    }
  }
});

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount' 
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created:', paymentIntent.id);
    
    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
});

// Confirm payment
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment intent ID required' 
      });
    }

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      console.log('Payment confirmed:', paymentIntentId);
      res.json({ 
        success: true, 
        status: 'succeeded',
        paymentIntentId: paymentIntent.id
      });
    } else {
      console.log('Payment not succeeded:', paymentIntentId, paymentIntent.status);
      res.json({ 
        success: false, 
        status: paymentIntent.status,
        error: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to confirm payment',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email, SMS and payment server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email, SMS and payment server running on port ${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`📱 SMS endpoint: http://localhost:${PORT}/api/send-sms`);
  console.log(`💳 Payment endpoints: http://localhost:${PORT}/api/create-payment-intent`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
