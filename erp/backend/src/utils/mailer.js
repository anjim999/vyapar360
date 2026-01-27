// src/utils/mailer.js - Enhanced Email Service using Brevo API
import { BREVO_API_KEY, EMAIL_FROM } from '../config/env.js';

// Parse sender from EMAIL_FROM config
function getSender() {
  const [senderName, senderEmailRaw] = EMAIL_FROM?.includes('<')
    ? EMAIL_FROM.split('<')
    : ['Vyapar360', EMAIL_FROM || 'noreply@vyapar360.com'];

  return {
    email: senderEmailRaw?.replace('>', '').trim() || 'noreply@vyapar360.com',
    name: senderName?.trim() || 'Vyapar360',
  };
}

// Base email sender function
export async function sendEmail({ to, subject, htmlContent, textContent }) {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured - email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const body = {
      sender: getSender(),
      to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
      subject,
      htmlContent,
      ...(textContent && { textContent }),
    };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Brevo API error:', res.status, text);
      return { success: false, error: `Brevo API ${res.status}` };
    }

    const data = await res.json();
    console.log('✉️ Email sent:', subject, 'to:', to, 'messageId:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Email Templates
const templates = {
  baseStyle: `
    font-family: 'Segoe UI', Arial, sans-serif;
    background-color: #f4f7fa;
    padding: 40px 20px;
  `,

  cardStyle: `
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  `,

  headerStyle: `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px;
    text-align: center;
  `,

  buttonStyle: `
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
  `,
};

// Wrap content in beautiful template
function wrapInTemplate(title, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="${templates.baseStyle}">
      <div style="${templates.cardStyle}">
        <div style="${templates.headerStyle}">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🏢 Vyapar360</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">${title}</h2>
          ${content}
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Vyapar360. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============== Email Functions ==============

// OTP Email (Registration/Password Reset)
export async function sendOtpEmail({ to, otp, purpose }) {
  const title = purpose === 'REGISTER' ? 'Verify Your Email' : 'Reset Your Password';
  const content = `
    <p style="color: #555; line-height: 1.6;">
      ${purpose === 'REGISTER'
      ? 'Welcome! Please use the OTP below to verify your email address:'
      : 'You requested to reset your password. Use the OTP below:'}
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">${otp}</span>
      </div>
    </div>
    <p style="color: #888; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
  `;

  return sendEmail({
    to,
    subject: `${otp} - Your OTP for Vyapar360`,
    htmlContent: wrapInTemplate(title, content),
  });
}

// Welcome Email (After Registration)
export async function sendWelcomeEmail({ to, name }) {
  const content = `
    <p style="color: #555; line-height: 1.6;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="color: #555; line-height: 1.6;">
      Welcome to <strong>Vyapar360</strong>! Your account has been successfully created.
    </p>
    <p style="color: #555; line-height: 1.6;">
      Here's what you can do now:
    </p>
    <ul style="color: #555; line-height: 1.8;">
      <li>🏢 Register your company or browse the marketplace</li>
      <li>📊 Access powerful ERP modules (HR, Finance, Inventory, CRM)</li>
      <li>🤝 Connect with businesses across India</li>
    </ul>
    <div style="text-align: center;">
      <a href="https://vyapar360.vercel.app/dashboard" style="${templates.buttonStyle}">Go to Dashboard</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Vyapar360! 🎉',
    htmlContent: wrapInTemplate('Welcome Aboard!', content),
  });
}

// Company Approval Email
export async function sendCompanyApprovalEmail({ to, name, companyName, approved, notes }) {
  const title = approved ? 'Company Approved! 🎉' : 'Company Registration Update';
  const content = approved ? `
    <p style="color: #555; line-height: 1.6;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="color: #555; line-height: 1.6;">
      Great news! Your company <strong>"${companyName}"</strong> has been approved and is now active on Vyapar360.
    </p>
    <p style="color: #555; line-height: 1.6;">
      You now have access to all company admin features:
    </p>
    <ul style="color: #555; line-height: 1.8;">
      <li>👥 HR Module - Manage employees, attendance, payroll</li>
      <li>💰 Finance Module - Invoices, expenses, reports</li>
      <li>📦 Inventory Module - Stock management</li>
      <li>🤝 CRM Module - Leads and customers</li>
      <li>📊 Projects Module - Tasks and milestones</li>
    </ul>
    <div style="text-align: center;">
      <a href="https://vyapar360.vercel.app/dashboard" style="${templates.buttonStyle}">Access Dashboard</a>
    </div>
  ` : `
    <p style="color: #555; line-height: 1.6;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="color: #555; line-height: 1.6;">
      Unfortunately, your company registration for <strong>"${companyName}"</strong> could not be approved at this time.
    </p>
    ${notes ? `<p style="color: #555; line-height: 1.6;"><strong>Reason:</strong> ${notes}</p>` : ''}
    <p style="color: #555; line-height: 1.6;">
      You can submit a new request with updated information or contact our support team for assistance.
    </p>
  `;

  return sendEmail({
    to,
    subject: approved ? `${companyName} is now live on Vyapar360! 🚀` : `Update on your company registration`,
    htmlContent: wrapInTemplate(title, content),
  });
}

// Password Changed Notification
export async function sendPasswordChangedEmail({ to, name }) {
  const content = `
    <p style="color: #555; line-height: 1.6;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="color: #555; line-height: 1.6;">
      Your password has been successfully changed. If you did not make this change, please contact our support team immediately.
    </p>
    <p style="color: #888; font-size: 13px;">
      Changed on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    </p>
  `;

  return sendEmail({
    to,
    subject: 'Password Changed - Vyapar360',
    htmlContent: wrapInTemplate('Password Updated', content),
  });
}

// New Employee Welcome Email
export async function sendEmployeeWelcomeEmail({ to, name, companyName, tempPassword }) {
  const content = `
    <p style="color: #555; line-height: 1.6;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="color: #555; line-height: 1.6;">
      You have been added as an employee at <strong>${companyName}</strong> on Vyapar360.
    </p>
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
      <p style="margin: 5px 0;">📧 Email: <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">${to}</code></p>
      ${tempPassword ? `<p style="margin: 5px 0;">🔐 Temporary Password: <code style="background: #eee; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>` : ''}
    </div>
    <p style="color: #e74c3c; font-size: 13px;">⚠️ Please change your password after first login.</p>
    <div style="text-align: center;">
      <a href="https://vyapar360.vercel.app/login" style="${templates.buttonStyle}">Login Now</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Welcome to ${companyName} on Vyapar360`,
    htmlContent: wrapInTemplate('Welcome to the Team!', content),
  });
}

// Invoice Email
export async function sendInvoiceEmail({ to, customerName, invoiceNumber, amount, dueDate, companyName }) {
  const content = `
    <p style="color: #555; line-height: 1.6;">
      Dear <strong>${customerName}</strong>,
    </p>
    <p style="color: #555; line-height: 1.6;">
      Please find below the details of your invoice from <strong>${companyName}</strong>:
    </p>
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #888;">Invoice Number:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${invoiceNumber}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Amount:</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #667eea;">₹${amount?.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Due Date:</td><td style="padding: 8px 0; text-align: right;">${dueDate}</td></tr>
      </table>
    </div>
    <p style="color: #888; font-size: 13px;">Please ensure payment is made by the due date to avoid any late fees.</p>
  `;

  return sendEmail({
    to,
    subject: `Invoice ${invoiceNumber} from ${companyName}`,
    htmlContent: wrapInTemplate('Invoice', content),
  });
}

// Generic Notification Email
export async function sendNotificationEmail({ to, title, message, actionUrl, actionText }) {
  const content = `
    <p style="color: #555; line-height: 1.6;">
      ${message}
    </p>
    ${actionUrl ? `
      <div style="text-align: center;">
        <a href="${actionUrl}" style="${templates.buttonStyle}">${actionText || 'View Details'}</a>
      </div>
    ` : ''}
  `;

  return sendEmail({
    to,
    subject: title,
    htmlContent: wrapInTemplate(title, content),
  });
}

// New Company Request Email (for Platform Admin)
export async function sendNewCompanyRequestEmail({ to, adminName, companyName, userName, industry }) {
  const content = `
    <p style="color: #555; line-height: 1.6;">
      Hi <strong>${adminName || 'Admin'}</strong>,
    </p>
    <p style="color: #555; line-height: 1.6;">
      A new company registration request has been submitted and requires your review.
    </p>
    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Company Name:</strong> ${companyName}</p>
      <p style="margin: 5px 0;"><strong>Requested By:</strong> ${userName}</p>
      <p style="margin: 5px 0;"><strong>Industry:</strong> ${industry}</p>
    </div>
    <div style="text-align: center;">
      <a href="https://vyapar360.vercel.app/admin/company-requests" style="${templates.buttonStyle}">Review Request</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🏢 New Company Request: ${companyName}`,
    htmlContent: wrapInTemplate('New Company Registration Request', content),
  });
}

// Export all functions
export default {
  sendOtpEmail,
  sendWelcomeEmail,
  sendCompanyApprovalEmail,
  sendPasswordChangedEmail,
  sendEmployeeWelcomeEmail,
  sendInvoiceEmail,
  sendNotificationEmail,
  sendNewCompanyRequestEmail,
};
