import { supabase } from '../lib/supabase';
import { AppSettings, BusinessSettings, PaymentSettings, GeneralSettings, EmailSettings, SMSSettings } from './settings';

// Load all settings from database
export const loadSettingsFromDatabase = async (): Promise<AppSettings | null> => {
  try {
    console.log('Loading settings from database...');

    // Load all settings in parallel, always getting the first row
    const [businessResult, paymentResult, generalResult, emailResult, smsResult] = await Promise.all([
      supabase.from('business_settings').select('*').order('created_at', { ascending: true }).limit(1),
      supabase.from('payment_settings').select('*').order('created_at', { ascending: true }).limit(1),
      supabase.from('general_settings').select('*').order('created_at', { ascending: true }).limit(1),
      supabase.from('email_settings').select('*').order('created_at', { ascending: true }).limit(1),
      supabase.from('sms_settings').select('*').order('created_at', { ascending: true }).limit(1)
    ]);

    // Check for errors in each result
    if (businessResult.error) console.error('Business settings error:', businessResult.error);
    if (paymentResult.error) console.error('Payment settings error:', paymentResult.error);
    if (generalResult.error) console.error('General settings error:', generalResult.error);
    if (emailResult.error) console.error('Email settings error:', emailResult.error);
    if (smsResult.error) console.error('SMS settings error:', smsResult.error);

    // Extract data from results (always the first row)
    const businessData = businessResult.data?.[0];
    const paymentData = paymentResult.data?.[0];
    const generalData = generalResult.data?.[0];
    const emailData = emailResult.data?.[0];
    const smsData = smsResult.data?.[0];

    console.log('Database results:', {
      business: businessData,
      payment: paymentData,
      general: generalData,
      email: emailData,
      sms: smsData
    });

    // Return combined settings with proper fallbacks
    return {
      business: {
        businessName: businessData?.business_name || 'Laser Engraving Business',
        businessEmail: businessData?.business_email || 'business@example.com',
        phoneNumber: businessData?.phone_number || '',
        businessAddress: businessData?.business_address || '',
        businessLogo: businessData?.business_logo || '',
      },
      payment: {
        stripePublishableKey: paymentData?.stripe_publishable_key || '',
        stripeSecretKey: paymentData?.stripe_secret_key || '',
        paymentTiming: (paymentData?.payment_timing as 'before_submission' | 'at_pickup') || 'before_submission',
      },
      general: {
        country: generalData?.country || 'United States',
        currency: generalData?.currency || 'US Dollar ($)',
        taxRate: generalData?.tax_rate || 0,
      },
      email: {
        resendApiKey: emailData?.resend_api_key || '',
        fromEmail: emailData?.from_email || '',
        emailNotifications: emailData?.email_notifications !== undefined ? emailData.email_notifications : true,
      },
      sms: {
        twilioAccountSid: smsData?.twilio_account_sid || '',
        twilioAuthToken: smsData?.twilio_auth_token || '',
        twilioPhoneNumber: smsData?.twilio_phone_number || '',
        smsNotifications: smsData?.sms_notifications !== undefined ? smsData.sms_notifications : false,
      },
    };
  } catch (error) {
    console.error('Error loading settings from database:', error);
    return null;
  }
};

// Save business settings to database
export const saveBusinessSettings = async (settings: BusinessSettings): Promise<boolean> => {
  try {
    // First, get the existing row ID
    const { data: existingRow } = await supabase
      .from('business_settings')
      .select('id')
      .limit(1)
      .single();

    if (!existingRow) {
      console.error('No existing business settings row found');
      return false;
    }

    // Update the existing row
    const { error } = await supabase
      .from('business_settings')
      .update({
        business_name: settings.businessName || 'Laser Engraving Business',
        business_email: settings.businessEmail || 'business@example.com',
        phone_number: settings.phoneNumber || '',
        business_address: settings.businessAddress || '',
        business_logo: settings.businessLogo || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRow.id);

    if (error) {
      console.error('Error saving business settings:', error);
      return false;
    }

    console.log('Business settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving business settings:', error);
    return false;
  }
};

// Save payment settings to database
export const savePaymentSettings = async (settings: PaymentSettings): Promise<boolean> => {
  try {
    // First, get the existing row ID
    const { data: existingRow } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
      .single();

    if (!existingRow) {
      console.error('No existing payment settings row found');
      return false;
    }

    // Update the existing row
    const { error } = await supabase
      .from('payment_settings')
      .update({
        stripe_publishable_key: settings.stripePublishableKey || '',
        stripe_secret_key: settings.stripeSecretKey || '',
        payment_timing: settings.paymentTiming || 'before_submission',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRow.id);

    if (error) {
      console.error('Error saving payment settings:', error);
      return false;
    }

    console.log('Payment settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving payment settings:', error);
    return false;
  }
};

// Save general settings to database
export const saveGeneralSettings = async (settings: GeneralSettings): Promise<boolean> => {
  try {
    console.log('Attempting to save general settings...');
    console.log('Tax rate being saved:', settings.taxRate, 'Type:', typeof settings.taxRate);
    
    // First, get the existing row ID
    const { data: existingRow, error: selectError } = await supabase
      .from('general_settings')
      .select('id')
      .limit(1)
      .single();

    if (selectError) {
      console.error('Error selecting general settings row:', selectError);
      return false;
    }

    if (!existingRow) {
      console.error('No existing general settings row found');
      return false;
    }

    console.log('Found existing general settings row:', existingRow.id);

    // Ensure tax rate is within valid range (0 to 9.9999)
    const taxRate = Math.min(Math.max(settings.taxRate || 0, 0), 9.9999);
    console.log('Adjusted tax rate:', taxRate);

    // Update the existing row
    const { error: updateError } = await supabase
      .from('general_settings')
      .update({
        country: settings.country || 'United States',
        currency: settings.currency || 'US Dollar ($)',
        tax_rate: taxRate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRow.id);

    if (updateError) {
      console.error('Error updating general settings:', updateError);
      return false;
    }

    console.log('General settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving general settings:', error);
    return false;
  }
};

// Save email settings to database
export const saveEmailSettings = async (settings: EmailSettings): Promise<boolean> => {
  try {
    console.log('Attempting to save email settings...');
    
    // First, get the existing row ID
    const { data: existingRow, error: selectError } = await supabase
      .from('email_settings')
      .select('id')
      .limit(1)
      .single();

    if (selectError) {
      console.error('Error selecting email settings row:', selectError);
      return false;
    }

    if (!existingRow) {
      console.error('No existing email settings row found');
      return false;
    }

    console.log('Found existing email settings row:', existingRow.id);

    // Update the existing row
    const { error: updateError } = await supabase
      .from('email_settings')
      .update({
        resend_api_key: settings.resendApiKey || '',
        from_email: settings.fromEmail || '',
        email_notifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRow.id);

    if (updateError) {
      console.error('Error updating email settings:', updateError);
      return false;
    }

    console.log('Email settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving email settings:', error);
    return false;
  }
};

// Save SMS settings to database
export const saveSMSSettings = async (settings: SMSSettings): Promise<boolean> => {
  try {
    console.log('Attempting to save SMS settings...');
    
    // First, get the existing row ID
    const { data: existingRow, error: selectError } = await supabase
      .from('sms_settings')
      .select('id')
      .limit(1)
      .single();

    if (selectError) {
      console.error('Error selecting SMS settings row:', selectError);
      return false;
    }

    if (!existingRow) {
      console.error('No existing SMS settings row found');
      return false;
    }

    console.log('Found existing SMS settings row:', existingRow.id);

    // Update the existing row
    const { error: updateError } = await supabase
      .from('sms_settings')
      .update({
        twilio_account_sid: settings.twilioAccountSid || '',
        twilio_auth_token: settings.twilioAuthToken || '',
        twilio_phone_number: settings.twilioPhoneNumber || '',
        sms_notifications: settings.smsNotifications !== undefined ? settings.smsNotifications : false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingRow.id);

    if (updateError) {
      console.error('Error updating SMS settings:', updateError);
      return false;
    }

    console.log('SMS settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving SMS settings:', error);
    return false;
  }
};

// Save all settings to database
export const saveAllSettings = async (settings: AppSettings): Promise<boolean> => {
  try {
    const results = await Promise.all([
      saveBusinessSettings(settings.business),
      savePaymentSettings(settings.payment),
      saveGeneralSettings(settings.general),
      saveEmailSettings(settings.email),
      saveSMSSettings(settings.sms),
    ]);

    return results.every(result => result === true);
  } catch (error) {
    console.error('Error saving all settings:', error);
    return false;
  }
};
