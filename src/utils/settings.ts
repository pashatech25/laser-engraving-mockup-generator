import { loadSettingsFromDatabase, saveAllSettings } from './database';

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  phoneNumber: string;
  businessAddress: string;
  businessLogo: string;
}

export interface PaymentSettings {
  paymentTiming: 'before_submission' | 'at_pickup';
  stripePublishableKey: string;
  stripeSecretKey: string;
}

export interface GeneralSettings {
  country: string;
  currency: string;
  taxRate: number;
}

export interface EmailSettings {
  resendApiKey: string;
  fromEmail: string;
  emailNotifications: boolean;
}

export interface SMSSettings {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  smsNotifications: boolean;
}

export interface AppSettings {
  business: BusinessSettings;
  payment: PaymentSettings;
  general: GeneralSettings;
  email: EmailSettings;
  sms: SMSSettings;
}

// Default settings
export const defaultSettings: AppSettings = {
  business: {
    businessName: 'Laser Engraving Business',
    businessEmail: 'business@example.com',
    phoneNumber: '',
    businessAddress: '',
    businessLogo: '',
  },
  payment: {
    paymentTiming: 'before_submission',
    stripePublishableKey: 'pk_test_...',
    stripeSecretKey: 'sk_test_...',
  },
  general: {
    country: 'United States',
    currency: 'US Dollar ($)',
    taxRate: 0.00, // Ensure this is a number, not a string
  },
  email: {
    resendApiKey: '',
    fromEmail: '',
    emailNotifications: true,
  },
  sms: {
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    smsNotifications: false,
  },
};

// Load settings with database fallback to localStorage
export const loadSettings = async (): Promise<AppSettings> => {
  try {
    // Try to load from database first
    const dbSettings = await loadSettingsFromDatabase();
    if (dbSettings) {
      return dbSettings;
    }
  } catch (error) {
    console.log('Database loading failed, falling back to localStorage');
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem('appSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored settings:', error);
    }
  }
  
  return defaultSettings;
};

// Load settings synchronously (for backward compatibility)
export const loadSettingsSync = (): AppSettings => {
  const stored = localStorage.getItem('appSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored settings:', error);
    }
  }
  return defaultSettings;
};

// Save all settings to database
export const saveSettings = async (settings: AppSettings): Promise<boolean> => {
  try {
    console.log('Saving settings to database...');
    
    const success = await saveAllSettings(settings);
    
    if (success) {
      console.log('Settings saved to database successfully');
      return true;
    } else {
      console.error('Failed to save settings to database');
      return false;
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Save settings synchronously (for backward compatibility)
export const saveSettingsSync = (settings: AppSettings): void => {
  try {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }
};

// Get current tax rate
export const getTaxRate = (): number => {
  const settings = loadSettingsSync();
  return settings.general.taxRate;
};

// Calculate tax amount
export const calculateTax = (subtotal: number): number => {
  const taxRate = getTaxRate();
  return (subtotal * taxRate) / 100;
};

// Calculate total with tax
export const calculateTotal = (subtotal: number): number => {
  const taxAmount = calculateTax(subtotal);
  return subtotal + taxAmount;
};

// Format currency based on settings
export const formatCurrency = (amount: number): string => {
  const settings = loadSettingsSync();
  const currency = settings.general.currency;
  
  // Extract currency symbol
  const symbol = currency.includes('$') ? '$' : 
                 currency.includes('€') ? '€' : 
                 currency.includes('£') ? '£' : 
                 currency.includes('¥') ? '¥' : '$';
  
  return `${symbol}${amount.toFixed(2)}`;
};

