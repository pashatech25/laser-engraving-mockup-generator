import { Job, Product } from '../types';
import { loadSettingsFromDatabase } from './database';

// Email template for order confirmation
export const generateOrderConfirmationEmail = (
  job: Job, 
  businessName: string,
  businessEmail: string
) => {
  const { customerName, customerEmail, product, status, createdAt } = job;
  const orderDate = new Date(createdAt).toLocaleDateString();
  
  return {
    subject: `Order Confirmation - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.5; 
            color: #1d1d1f; 
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 16px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            padding: 0;
          }
          .header { 
            background: #f5f5f7;
            padding: 60px 40px 40px 40px; 
            text-align: center; 
            border-bottom: 1px solid #e5e5e7;
          }
          .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 600;
            letter-spacing: -0.5px;
            color: #1d1d1f;
          }
          .header p { 
            margin: 16px 0 0 0; 
            font-size: 18px;
            color: #86868b;
            font-weight: 400;
          }
          .content { 
            padding: 40px; 
          }
          .section {
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1d1d1f;
            margin: 0 0 20px 0;
            letter-spacing: -0.3px;
          }
          .order-details { 
            background: #f5f5f7; 
            padding: 24px; 
            border-radius: 8px; 
            margin: 0;
            border: 1px solid #e5e5e7;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e7;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 500;
            color: #86868b;
            font-size: 14px;
          }
          .detail-value {
            font-weight: 400;
            color: #1d1d1f;
            font-size: 14px;
          }
          .status-badge { 
            background: #f5f5f7;
            color: #1d1d1f;
            padding: 6px 12px; 
            border-radius: 6px; 
            font-size: 12px; 
            font-weight: 500;
            border: 1px solid #e5e5e7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .product-info { 
            display: flex; 
            align-items: center; 
            margin: 0;
            padding: 24px;
            background: #f5f5f7;
            border-radius: 8px;
            border: 1px solid #e5e5e7;
          }
          .product-image { 
            width: 60px; 
            height: 60px; 
            object-fit: cover; 
            border-radius: 8px; 
            margin-right: 20px; 
            border: 1px solid #e5e5e7;
          }
          .product-details h4 {
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1d1d1f;
          }
          .product-details p {
            margin: 0 0 6px 0;
            font-size: 14px;
            color: #86868b;
            line-height: 1.4;
          }
          .footer { 
            text-align: center; 
            color: #86868b; 
            font-size: 14px; 
            padding: 40px;
            background: #f5f5f7;
            border-top: 1px solid #e5e5e7;
          }
          .footer p {
            margin: 0 0 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed</h1>
            <p>Thank you for your order, ${customerName}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2 class="section-title">Order Details</h2>
              <div class="order-details">
                <div class="detail-row">
                  <span class="detail-label">Order Date</span>
                  <span class="detail-value">${orderDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status</span>
                  <span class="status-badge">${status}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Customer</span>
                  <span class="detail-value">${customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">${customerEmail}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">Product</h2>
              <div class="product-info">
                ${product.images[0] ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image">` : ''}
                <div class="product-details">
                  <h4>${product.name}</h4>
                  <p>${product.description}</p>
                  <p><strong>Price:</strong> $${product.price}</p>
                  <p><strong>Surface:</strong> ${product.surfaceTone}</p>
                </div>
              </div>
            </div>
            
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
              We'll start processing your laser engraving order right away. You'll receive updates on your order status via email.
            </p>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact us at ${businessEmail}</p>
            <p>© ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Order Confirmation - ${product.name}

Dear ${customerName},

Thank you for your order! We're excited to start working on your laser engraving project.

Order Details:
- Order Date: ${orderDate}
- Order Status: ${status}
- Product: ${product.name}
- Description: ${product.description}
- Price: $${product.price}
- Surface: ${product.surfaceTone}

We'll start processing your order right away and keep you updated on the progress.

If you have any questions, please contact us at ${businessEmail}.

Best regards,
${businessName}
    `
  };
};

// Email template for order completion
export const generateOrderCompletionEmail = (
  job: Job, 
  businessName: string,
  businessEmail: string
) => {
  const { customerName, product } = job;
  
  return {
    subject: `Your Order is Complete! - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Complete</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.5; 
            color: #1d1d1f; 
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 16px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            padding: 0;
          }
          .header { 
            background: #f5f5f7;
            padding: 60px 40px 40px 40px; 
            text-align: center; 
            border-bottom: 1px solid #e5e5e7;
          }
          .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 600;
            letter-spacing: -0.5px;
            color: #1d1d1f;
          }
          .header p { 
            margin: 16px 0 0 0; 
            font-size: 18px;
            color: #86868b;
            font-weight: 400;
          }
          .content { 
            padding: 40px; 
          }
          .section {
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1d1d1f;
            margin: 0 0 20px 0;
            letter-spacing: -0.3px;
          }
          .cta { 
            background: #f5f5f7;
            color: #1d1d1f; 
            padding: 24px 30px; 
            text-align: center; 
            border-radius: 8px; 
            margin: 0 0 24px 0; 
            border: 1px solid #e5e5e7;
          }
          .cta h3 { 
            margin: 0 0 8px 0; 
            font-size: 20px; 
            font-weight: 600;
            color: #1d1d1f;
          }
          .cta p { 
            margin: 0; 
            font-size: 16px;
            color: #86868b;
          }
          .checklist {
            background: #f5f5f7;
            padding: 24px;
            border-radius: 8px;
            margin: 0;
            border: 1px solid #e5e5e7;
          }
          .checklist h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1d1d1f;
          }
          .checklist ul {
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .checklist li {
            margin: 12px 0;
            padding-left: 24px;
            position: relative;
            font-size: 14px;
            color: #86868b;
          }
          .checklist li:before {
            content: '';
            position: absolute;
            left: 0;
            top: 6px;
            width: 6px;
            height: 6px;
            background: #86868b;
            border-radius: 50%;
          }
          .footer { 
            text-align: center; 
            color: #86868b; 
            font-size: 14px; 
            padding: 40px;
            background: #f5f5f7;
            border-top: 1px solid #e5e5e7;
          }
          .footer p {
            margin: 0 0 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Complete</h1>
            <p>${customerName}, your laser engraving is ready!</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2 class="section-title">Great News!</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                Your ${product.name} has been successfully engraved and is ready for pickup!
              </p>
            </div>
            
            <div class="cta">
              <h3>Ready for Pickup</h3>
              <p>Please visit our location to collect your order.</p>
            </div>
            
            <div class="checklist">
              <h4>What to bring:</h4>
              <ul>
                <li>Photo ID</li>
                <li>Order confirmation (this email)</li>
                <li>Payment method (if paying at pickup)</li>
              </ul>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
              We can't wait for you to see your finished product!
            </p>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact us at ${businessEmail}</p>
            <p>© ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Your Order is Complete! - ${product.name}

Dear ${customerName},

Great news! Your ${product.name} has been successfully engraved and is ready for pickup!

Your laser engraving is complete and ready for collection. Please visit our location to pick up your order.

What to bring:
- Photo ID
- Order confirmation (this email)
- Payment method (if paying at pickup)

We can't wait for you to see your finished product!

Best regards,
${businessName}
    `
  };
};

// Email template for order pickup
export const generateOrderPickupEmail = (
  job: Job, 
  businessName: string,
  businessEmail: string
) => {
  const { customerName, product } = job;
  
  return {
    subject: `Order Picked Up - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Picked Up</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.5; 
            color: #1d1d1f; 
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 16px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            padding: 0;
          }
          .header { 
            background: #f5f5f7;
            padding: 60px 40px 40px 40px; 
            text-align: center; 
            border-bottom: 1px solid #e5e5e7;
          }
          .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 600;
            letter-spacing: -0.5px;
            color: #1d1d1f;
          }
          .header p { 
            margin: 16px 0 0 0; 
            font-size: 18px;
            color: #86868b;
            font-weight: 400;
          }
          .content { 
            padding: 40px; 
          }
          .section {
            margin-bottom: 40px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1d1d1f;
            margin: 0 0 20px 0;
            letter-spacing: -0.3px;
          }
          .feedback { 
            background: #f5f5f7; 
            padding: 24px; 
            border-radius: 8px; 
            margin: 0; 
            text-align: center;
            border: 1px solid #e5e5e7;
          }
          .feedback h3 { 
            margin: 0 0 12px 0; 
            font-size: 18px; 
            font-weight: 600;
            color: #1d1d1f;
          }
          .feedback p { 
            margin: 0; 
            font-size: 14px;
            color: #86868b;
            line-height: 1.5;
          }
          .footer { 
            text-align: center; 
            color: #86868b; 
            font-size: 14px; 
            padding: 40px;
            background: #f5f5f7;
            border-top: 1px solid #e5e5e7;
          }
          .footer p {
            margin: 0 0 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Picked Up</h1>
            <p>Thank you for collecting your order, ${customerName}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2 class="section-title">Order Successfully Collected</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                We're glad you've received your ${product.name} laser engraving!
              </p>
            </div>
            
            <div class="section">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
                We hope you're happy with the quality and craftsmanship of your order.
              </p>
            </div>
            
            <div class="feedback">
              <h3>We'd Love Your Feedback!</h3>
              <p>Your satisfaction is important to us. If you have a moment, we'd appreciate hearing about your experience.</p>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.6; color: #1d1d1f;">
              Thank you for choosing ${businessName} for your laser engraving needs!
            </p>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact us at ${businessEmail}</p>
            <p>© ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Order Picked Up - ${product.name}

Dear ${customerName},

Thank you for collecting your ${product.name} laser engraving!

We're glad you've received your order and hope you're happy with the quality and craftsmanship.

We'd love your feedback! Your satisfaction is important to us, and we'd appreciate hearing about your experience.

Thank you for choosing ${businessName} for your laser engraving needs!

Best regards,
${businessName}
    `
  };
};

// Send email using our backend API (which calls Resend)
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string,
  fromEmail?: string,
  resendApiKey?: string
): Promise<boolean> => {
  try {
    // If email settings are provided, use them; otherwise load from database
    let emailFromEmail: string;
    let emailResendApiKey: string;
    
    if (fromEmail && resendApiKey) {
      emailFromEmail = fromEmail;
      emailResendApiKey = resendApiKey;
    } else {
      // Load settings from database
      const settings = await loadSettingsFromDatabase();
      if (!settings) {
        console.error('Failed to load settings from database');
        return false;
      }
      
      if (!settings.email.emailNotifications) {
        console.log('Email notifications disabled');
        return false;
      }
      
      if (!settings.email.resendApiKey) {
        console.warn('Resend API key not configured');
        return false;
      }
      
      if (!settings.email.fromEmail) {
        console.warn('From email not configured');
        return false;
      }
      
      emailFromEmail = settings.email.fromEmail;
      emailResendApiKey = settings.email.resendApiKey;
    }
    
    console.log('📧 Sending email via backend API:', {
      to: to,
      subject: subject,
      fromEmail: emailFromEmail,
      hasHtml: !!html,
      hasText: !!text
    });
    
    // Validate Resend API key format (starts with 're_')
    if (!emailResendApiKey.startsWith('re_')) {
      console.error('Invalid Resend API key format. Should start with "re_"');
      return false;
    }
    
    // Call our backend API (which will call Resend)
    const response = await fetch('http://localhost:3004/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: html,
        text: text,
        fromEmail: emailFromEmail,
        resendApiKey: emailResendApiKey
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend API error:', response.status, errorData);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Email sent successfully via backend:', result);
    return true;
    
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (job: Job): Promise<boolean> => {
  try {
    console.log('Sending order confirmation email for job:', job.id);
    
    // Load settings from database
    const settings = await loadSettingsFromDatabase();
    if (!settings) {
      console.error('Failed to load settings from database');
      return false;
    }

    const { business, email: emailSettings } = settings;
    
    if (!emailSettings.resendApiKey || !emailSettings.fromEmail) {
      console.error('Email settings not configured');
      return false;
    }

    const subject = `Order Confirmation - ${job.customerName}`;
    const { html, text } = generateOrderConfirmationEmail(job, business.businessName, business.businessEmail);

    const success = await sendEmail(
      job.customerEmail,
      subject,
      html,
      text,
      emailSettings.fromEmail,
      emailSettings.resendApiKey
    );

    if (success) {
      console.log('Order confirmation email sent successfully');
    } else {
      console.error('Failed to send order confirmation email');
    }

    return success;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

// Send order completion email
export const sendOrderCompletionEmail = async (job: Job): Promise<boolean> => {
  try {
    console.log('Sending order completion email for job:', job.id);
    
    // Load settings from database
    const settings = await loadSettingsFromDatabase();
    if (!settings) {
      console.error('Failed to load settings from database');
      return false;
    }

    const { business, email: emailSettings } = settings;
    
    if (!emailSettings.resendApiKey || !emailSettings.fromEmail) {
      console.error('Email settings not configured');
      return false;
    }

    const subject = `Your Order is Complete! - ${job.customerName}`;
    const { html, text } = generateOrderCompletionEmail(job, business.businessName, business.businessEmail);

    const success = await sendEmail(
      job.customerEmail,
      subject,
      html,
      text,
      emailSettings.fromEmail,
      emailSettings.resendApiKey
    );

    if (success) {
      console.log('Order completion email sent successfully');
    } else {
      console.error('Failed to send order completion email');
    }

    return success;
  } catch (error) {
    console.error('Error sending order completion email:', error);
    return false;
  }
};

// Send order pickup email
export const sendOrderPickupEmail = async (job: Job): Promise<boolean> => {
  try {
    console.log('Sending order pickup email for job:', job.id);
    
    // Load settings from database
    const settings = await loadSettingsFromDatabase();
    if (!settings) {
      console.error('Failed to load settings from database');
      return false;
    }

    const { business, email: emailSettings } = settings;
    
    if (!emailSettings.resendApiKey || !emailSettings.fromEmail) {
      console.error('Email settings not configured');
      return false;
    }

    const subject = `Order Picked Up - ${job.customerName}`;
    const { html, text } = generateOrderPickupEmail(job, business.businessName, business.businessEmail);

    const success = await sendEmail(
      job.customerEmail,
      subject,
      html,
      text,
      emailSettings.fromEmail,
      emailSettings.resendApiKey
    );

    if (success) {
      console.log('Order pickup email sent successfully');
    } else {
      console.error('Failed to send order pickup email');
    }

    return success;
  } catch (error) {
    console.error('Error sending order pickup email:', error);
    return false;
  }
};
