import { loadSettings } from './settings';

// Send SMS via backend API
const sendSMS = async (to: string, message: string, fromPhone?: string, twilioAccountSid?: string, twilioAuthToken?: string) => {
  try {
    // If credentials not provided, load from settings
    if (!fromPhone || !twilioAccountSid || !twilioAuthToken) {
      const settings = await loadSettings();
      if (!settings) {
        throw new Error('Settings not loaded');
      }
      
      // Use the correct database field names
      fromPhone = fromPhone || settings.sms.twilioPhoneNumber;
      twilioAccountSid = twilioAccountSid || settings.sms.twilioAccountSid;
      twilioAuthToken = twilioAuthToken || settings.sms.twilioAuthToken;
    }

    if (!fromPhone || !twilioAccountSid || !twilioAuthToken) {
      throw new Error('SMS credentials not configured');
    }

    const response = await fetch('http://localhost:3004/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        message,
        fromPhone,
        smsEnabled: true, // Pass this to the server
        twilioAccountSid,
        twilioAuthToken
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send SMS');
    }

    const result = await response.json();
    console.log('✅ SMS sent successfully via backend:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    throw error;
  }
};

// Generate order confirmation SMS
const generateOrderConfirmationSMS = (customerName: string, orderId: string, productName: string, total: string) => {
  return `Hi ${customerName}! Your order #${orderId} for ${productName} has been confirmed. Total: ${total}. We'll notify you when it's ready for pickup.`;
};

// Generate order completion SMS
const generateOrderCompletionSMS = (customerName: string, orderId: string, productName: string) => {
  return `Hi ${customerName}! Your order #${orderId} for ${productName} is complete and ready for pickup. Please visit us to collect your order.`;
};

// Generate order pickup SMS
const generateOrderPickupSMS = (customerName: string, orderId: string, productName: string) => {
  return `Hi ${customerName}! Thank you for picking up your order #${orderId} for ${productName}. We hope you love it!`;
};

// Send order confirmation SMS
export const sendOrderConfirmationSMS = async (job: any) => {
  try {
    const settings = await loadSettings();
    if (!settings) {
      console.warn('Settings not loaded, skipping SMS');
      return;
    }

    const { sms: smsSettings } = settings;
    
    // Check the correct database field name
    if (!smsSettings.smsNotifications) {
      console.log('📱 SMS notifications disabled, skipping');
      return;
    }

    if (!smsSettings.twilioPhoneNumber || !smsSettings.twilioAccountSid || !smsSettings.twilioAuthToken) {
      console.warn('SMS credentials not configured, skipping SMS');
      return;
    }

    const message = generateOrderConfirmationSMS(
      job.customerName,
      job.id,
      job.product.name,
      `$${job.product.price.toFixed(2)}`
    );

    console.log('📱 Sending order confirmation SMS to:', job.customerPhone);
    
    await sendSMS(
      job.customerPhone,
      message,
      smsSettings.twilioPhoneNumber,
      smsSettings.twilioAccountSid,
      smsSettings.twilioAuthToken
    );

    console.log('✅ Order confirmation SMS sent successfully');
  } catch (error) {
    console.error('❌ Failed to send order confirmation SMS:', error);
    // Don't throw - SMS failure shouldn't break the order flow
  }
};

// Send order completion SMS
export const sendOrderCompletionSMS = async (job: any) => {
  try {
    const settings = await loadSettings();
    if (!settings) {
      console.warn('Settings not loaded, skipping SMS');
      return;
    }

    const { sms: smsSettings } = settings;
    
    // Check the correct database field name
    if (!smsSettings.smsNotifications) {
      console.log('📱 SMS notifications disabled, skipping');
      return;
    }

    if (!smsSettings.twilioPhoneNumber || !smsSettings.twilioAccountSid || !smsSettings.twilioAuthToken) {
      console.warn('SMS credentials not configured, skipping SMS');
      return;
    }

    const message = generateOrderCompletionSMS(
      job.customerName,
      job.id,
      job.product.name
    );

    console.log('📱 Sending order completion SMS to:', job.customerPhone);
    
    await sendSMS(
      job.customerPhone,
      message,
      smsSettings.twilioPhoneNumber,
      smsSettings.twilioAccountSid,
      smsSettings.twilioAuthToken
    );

    console.log('✅ Order completion SMS sent successfully');
  } catch (error) {
    console.error('❌ Failed to send order completion SMS:', error);
    // Don't throw - SMS failure shouldn't break the order flow
  }
};

// Send order pickup SMS
export const sendOrderPickupSMS = async (job: any) => {
  try {
    const settings = await loadSettings();
    if (!settings) {
      console.warn('Settings not loaded, skipping SMS');
      return;
    }

    const { sms: smsSettings } = settings;
    
    // Check the correct database field name
    if (!smsSettings.smsNotifications) {
      console.log('📱 SMS notifications disabled, skipping');
      return;
    }

    if (!smsSettings.twilioPhoneNumber || !smsSettings.twilioAccountSid || !smsSettings.twilioAuthToken) {
      console.warn('SMS credentials not configured, skipping SMS');
      return;
    }

    const message = generateOrderPickupSMS(
      job.customerName,
      job.id,
      job.product.name
    );

    console.log('📱 Sending order pickup SMS to:', job.customerPhone);
    
    await sendSMS(
      job.customerPhone,
      message,
      smsSettings.twilioPhoneNumber,
      smsSettings.twilioAccountSid,
      smsSettings.twilioAuthToken
    );

    console.log('✅ Order pickup SMS sent successfully');
  } catch (error) {
    console.error('❌ Failed to send order pickup SMS:', error);
    // Don't throw - SMS failure shouldn't break the order flow
  }
};

// Test SMS function
export const sendTestSMS = async (to: string, message: string) => {
  try {
    const settings = await loadSettings();
    if (!settings) {
      throw new Error('Settings not loaded');
    }

    const { sms: smsSettings } = settings;
    
    // Check the correct database field name
    if (!smsSettings.smsNotifications) {
      throw new Error('SMS notifications are disabled');
    }

    if (!smsSettings.twilioPhoneNumber || !smsSettings.twilioAccountSid || !smsSettings.twilioAuthToken) {
      throw new Error('SMS credentials not configured');
    }

    console.log('📱 Sending test SMS to:', to);
    
    const result = await sendSMS(
      to,
      message,
      smsSettings.twilioPhoneNumber,
      smsSettings.twilioAccountSid,
      smsSettings.twilioAuthToken
    );

    console.log('✅ Test SMS sent successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to send test SMS:', error);
    throw error;
  }
};
