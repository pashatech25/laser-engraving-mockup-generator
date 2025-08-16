import React, { useState, useEffect } from 'react';
import { 
  Building, 
  CreditCard, 
  Settings as SettingsIcon, 
  Mail, 
  MessageSquare,
  Phone,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { loadSettings, saveSettings, AppSettings, BusinessSettings, PaymentSettings, GeneralSettings, EmailSettings, SMSSettings } from '../../utils/settings';
import { sendOrderConfirmationEmail } from '../../utils/email';
import { sendTestSMS } from '../../utils/sms';
import { Job, Product } from '../../types';
import { useApp } from '../../contexts/AppContext';

const SettingsManagement: React.FC = () => {
  const { logoutAdmin } = useApp();
  const [settings, setSettings] = useState<AppSettings>({
    business: { businessName: '', businessEmail: '', phoneNumber: '', businessAddress: '', businessLogo: '' },
    payment: { paymentTiming: 'before_submission', stripePublishableKey: '', stripeSecretKey: '' },
    general: { country: 'United States', currency: 'US Dollar ($)', taxRate: 0 },
    email: { resendApiKey: '', fromEmail: '', emailNotifications: false },
    sms: { twilioAccountSid: '', twilioAuthToken: '', twilioPhoneNumber: '', smsNotifications: false }
  });
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const loadedSettings = await loadSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Keep default settings if loading fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await saveSettings(settings);
      if (success) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof AppSettings, updates: Partial<BusinessSettings | PaymentSettings | GeneralSettings | EmailSettings | SMSSettings>) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateSettings('business', { businessLogo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Don't render until settings are loaded
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderBusinessSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <input
            type="text"
            value={settings.business.businessName}
            onChange={(e) => updateSettings('business', { businessName: e.target.value })}
            placeholder="Enter business name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Email
          </label>
          <input
            type="email"
            value={settings.business.businessEmail}
            onChange={(e) => updateSettings('business', { businessEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.business.phoneNumber}
            onChange={(e) => updateSettings('business', { phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address
          </label>
          <input
            type="text"
            value={settings.business.businessAddress}
            onChange={(e) => updateSettings('business', { businessAddress: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Logo
          </label>
          <div className="flex items-center space-x-4">
            {settings.business.businessLogo && (
              <img 
                src={settings.business.businessLogo} 
                alt="Business Logo" 
                className="w-16 h-16 object-cover rounded border"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Upload Logo</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Timing
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentTiming"
                value="before_submission"
                checked={settings.payment.paymentTiming === 'before_submission'}
                onChange={(e) => updateSettings('payment', { paymentTiming: e.target.value as any })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Payment required before order submission</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentTiming"
                value="at_pickup"
                checked={settings.payment.paymentTiming === 'at_pickup'}
                onChange={(e) => updateSettings('payment', { paymentTiming: e.target.value as any })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Payment at pickup (both options available)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stripe Publishable Key
          </label>
          <input
            type="text"
            value={settings.payment.stripePublishableKey}
            onChange={(e) => updateSettings('payment', { stripePublishableKey: e.target.value })}
            placeholder="pk_test_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stripe Secret Key
          </label>
          <input
            type="password"
            value={settings.payment.stripeSecretKey}
            onChange={(e) => updateSettings('payment', { stripeSecretKey: e.target.value })}
            placeholder="sk_test_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            value={settings.general.country}
            onChange={(e) => updateSettings('general', { country: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            type="text"
            value={settings.general.currency}
            onChange={(e) => updateSettings('general', { currency: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={settings.general.taxRate * 100} // Display as percentage
            onChange={(e) => {
              const percentage = parseFloat(e.target.value) || 0;
              const decimal = percentage / 100; // Convert to decimal (e.g., 15% = 0.15)
              updateSettings('general', { taxRate: decimal });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Current tax rate: {(settings.general.taxRate * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resend API Key
          </label>
          <input
            type="password"
            value={settings.email.resendApiKey}
            onChange={(e) => updateSettings('email', { resendApiKey: e.target.value })}
            placeholder="re_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Email Address
          </label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSettings('email', { fromEmail: e.target.value })}
            placeholder="noreply@yourbusiness.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={settings.email.emailNotifications}
            onChange={(e) => updateSettings('email', { emailNotifications: e.target.checked })}
            className="text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="emailNotifications" className="text-sm text-gray-700">
            Enable email notifications for order updates
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              // Create a sample job for testing
              const testJob: Job = {
                id: 'test-' + Date.now(),
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                customerPhone: '+1234567890',
                product: {
                  id: 'test-product',
                  name: 'Test Product',
                  description: 'A test product for email testing',
                  price: 29.99,
                  images: [],
                  surfaceTone: 'light',
                  mockupImage: '',
                  engravingBoundary: { x: 0, y: 0, width: 100, height: 100 }
                },
                uploadedImage: '',
                processedImage: '',
                mockupImage: '',
                imagePosition: { x: 0, y: 0, scale: 1, rotation: 0 },
                textLayers: [],
                status: 'pending',
                createdAt: new Date().toISOString()
              };
              
              console.log('Testing email with job:', testJob);
              console.log('Current email settings:', settings.email);
              
              sendOrderConfirmationEmail(testJob).then(success => {
                if (success) {
                  alert('Test email sent successfully! Check the console for details.');
                } else {
                  alert('Failed to send test email. Check the console for details.');
                }
              }).catch(error => {
                console.error('Test email error:', error);
                alert('Error sending test email: ' + error.message);
              });
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>Send Test Email</span>
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="text-sm font-medium text-green-800 mb-2">📧 Email Integration Ready</h4>
          <p className="text-sm text-green-700">
            Your email integration is now complete! The system will send real emails via Resend when:
            orders are submitted, completed, or picked up. Make sure your backend server is running on port 3001.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSMSSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twilio Account SID
          </label>
          <input
            type="text"
            value={settings.sms.twilioAccountSid}
            onChange={(e) => updateSettings('sms', { twilioAccountSid: e.target.value })}
            placeholder="AC..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twilio Auth Token
          </label>
          <input
            type="password"
            value={settings.sms.twilioAuthToken}
            onChange={(e) => updateSettings('sms', { twilioAuthToken: e.target.value })}
            placeholder="..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twilio Phone Number
          </label>
          <input
            type="tel"
            value={settings.sms.twilioPhoneNumber}
            onChange={(e) => updateSettings('sms', { twilioPhoneNumber: e.target.value })}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="smsNotifications"
            checked={settings.sms.smsNotifications}
            onChange={(e) => updateSettings('sms', { smsNotifications: e.target.checked })}
            className="text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="smsNotifications" className="text-sm text-gray-700">
            Enable SMS notifications for order updates
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const testPhoneNumber = settings.sms.twilioPhoneNumber || 'your_phone_number';
              const testMessage = 'This is a test SMS from your Laser Engraving system!';
              sendTestSMS(testPhoneNumber, testMessage).then(() => {
                alert('Test SMS sent successfully! Check your phone.');
              }).catch(error => {
                console.error('Test SMS error:', error);
                alert('Error sending test SMS: ' + error.message);
              });
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Send Test SMS</span>
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💬 SMS Integration Ready</h4>
          <p className="text-sm text-blue-700">
            Your SMS integration is now complete! The system will send real SMS messages via Twilio when:
            orders are submitted, completed, or picked up. Make sure your backend server is running on port 3001.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Settings Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        
        {/* Sub Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'business' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Business
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'payment' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payment
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'general' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-900'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'email' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'sms' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SMS
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'business' && renderBusinessSettings()}
        {activeTab === 'payment' && renderPaymentSettings()}
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'email' && renderEmailSettings()}
        {activeTab === 'sms' && renderSMSSettings()}
      </div>
    </div>
  );
};

export default SettingsManagement;
