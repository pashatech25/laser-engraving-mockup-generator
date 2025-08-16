# 📧 Email Integration Setup Guide

## 🚀 **Complete Email Integration with Resend**

Your laser engraving app now has full email automation! Here's how to set it up:

## 📋 **Prerequisites**

1. **Resend Account** - Sign up at [resend.com](https://resend.com)
2. **Verified Domain** - Add and verify your domain in Resend
3. **API Key** - Get your API key from Resend dashboard

## ⚙️ **Setup Steps**

### **1. Configure Email Settings**

Go to **Admin → Settings → Email** and fill in:

- ✅ **Resend API Key** - Your `re_...` key from Resend
- ✅ **From Email** - Verified email (e.g., `orders@yourdomain.com`)
- ✅ **Email Notifications** - Enable this

### **2. Start the Backend Server**

The email system requires a backend server to avoid CORS issues.

**Option A: Run Both Servers (Recommended)**
```bash
npm run dev:full
```

**Option B: Run Separately**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

### **3. Test the Integration**

1. **Send Test Email** - Click "Send Test Email" in Settings
2. **Submit Test Order** - Create a test order to trigger confirmation email
3. **Change Order Status** - Mark orders as completed/picked up

## 🔧 **How It Works**

### **Email Triggers**
- **Order Submission** → Confirmation email sent automatically
- **Order Completed** → "Ready for Pickup" email sent
- **Order Picked Up** → "Thank You" email with feedback request

### **Email Flow**
1. **Frontend** → Sends email data to backend
2. **Backend** → Calls Resend API with your credentials
3. **Resend** → Delivers email to customer
4. **Customer** → Receives professional, branded email

## 📁 **File Structure**

```
├── server.js                 # Backend email server
├── src/utils/email.ts        # Frontend email utilities
├── src/components/admin/     # Admin email management
└── package.json             # Scripts for running servers
```

## 🚨 **Troubleshooting**

### **"Backend API error"**
- Make sure backend server is running on port 3001
- Check console for detailed error messages

### **"Invalid Resend API key"**
- Ensure API key starts with `re_`
- Verify key is copied correctly from Resend dashboard

### **"Resend API error"**
- Check if your domain is verified in Resend
- Ensure "from" email matches verified domain
- Check Resend dashboard for rate limits or errors

### **Emails not received**
- Check spam/junk folder
- Verify recipient email is correct
- Check Resend dashboard for delivery status

## 🌐 **Production Deployment**

For production, you'll need to:

1. **Deploy backend** to your hosting provider
2. **Update frontend** to call production backend URL
3. **Set environment variables** for production API keys
4. **Configure domain** in production environment

## 📞 **Support**

If you encounter issues:
1. Check browser console for error messages
2. Check backend server console for API errors
3. Verify Resend dashboard for delivery status
4. Ensure all settings are configured correctly

---

**🎉 Your email integration is now complete and ready to use!**
