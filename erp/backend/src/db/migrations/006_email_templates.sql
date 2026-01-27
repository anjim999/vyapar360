-- Email Templates Schema
-- Add to erp/backend/src/db/migrations/

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    category VARCHAR(50) DEFAULT 'general',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, slug)
);

-- Email Logs Table (for tracking sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    template_id INTEGER REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    body TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, opened, clicked
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_company ON email_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);
CREATE INDEX IF NOT EXISTS idx_email_logs_company ON email_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Default system templates (for platform-wide use)
INSERT INTO email_templates (company_id, name, slug, subject, body, variables, category, is_default) VALUES
(NULL, 'Welcome Email', 'welcome', 'Welcome to Vyapar360, {{user_name}}!', 
'<h2>Welcome to Vyapar360!</h2>
<p>Hi {{user_name}},</p>
<p>We''re excited to have you on board. Your account has been created successfully.</p>
<p><strong>Email:</strong> {{user_email}}</p>
<p>Start exploring our platform to manage your business efficiently.</p>
<p>Best regards,<br>The Vyapar360 Team</p>',
'["user_name", "user_email"]', 'auth', true),

(NULL, 'Password Reset', 'password-reset', 'Reset Your Password - Vyapar360',
'<h2>Password Reset Request</h2>
<p>Hi {{user_name}},</p>
<p>We received a request to reset your password. Use the OTP below:</p>
<p style="font-size: 24px; font-weight: bold; color: #3b82f6;">{{otp}}</p>
<p>This OTP will expire in {{expiry_time}} minutes.</p>
<p>If you didn''t request this, please ignore this email.</p>
<p>Best regards,<br>The Vyapar360 Team</p>',
'["user_name", "otp", "expiry_time"]', 'auth', true),

(NULL, 'Invoice Email', 'invoice', 'Invoice {{invoice_number}} from {{company_name}}',
'<h2>Invoice from {{company_name}}</h2>
<p>Dear {{customer_name}},</p>
<p>Please find your invoice details below:</p>
<table style="width: 100%; border-collapse: collapse;">
  <tr><td><strong>Invoice Number:</strong></td><td>{{invoice_number}}</td></tr>
  <tr><td><strong>Amount:</strong></td><td>₹{{amount}}</td></tr>
  <tr><td><strong>Due Date:</strong></td><td>{{due_date}}</td></tr>
</table>
<p>Please make the payment before the due date.</p>
<p>Thank you for your business!</p>
<p>Best regards,<br>{{company_name}}</p>',
'["company_name", "customer_name", "invoice_number", "amount", "due_date"]', 'finance', true),

(NULL, 'Leave Approval', 'leave-approval', 'Leave Request {{status}} - Vyapar360',
'<h2>Leave Request {{status}}</h2>
<p>Hi {{employee_name}},</p>
<p>Your leave request has been <strong>{{status}}</strong>.</p>
<table style="width: 100%; border-collapse: collapse;">
  <tr><td><strong>Leave Type:</strong></td><td>{{leave_type}}</td></tr>
  <tr><td><strong>From:</strong></td><td>{{from_date}}</td></tr>
  <tr><td><strong>To:</strong></td><td>{{to_date}}</td></tr>
  <tr><td><strong>Days:</strong></td><td>{{days}}</td></tr>
</table>
{{#if remarks}}<p><strong>Remarks:</strong> {{remarks}}</p>{{/if}}
<p>Best regards,<br>HR Team</p>',
'["employee_name", "status", "leave_type", "from_date", "to_date", "days", "remarks"]', 'hr', true),

(NULL, 'Payment Reminder', 'payment-reminder', 'Payment Reminder: Invoice {{invoice_number}}',
'<h2>Payment Reminder</h2>
<p>Dear {{customer_name}},</p>
<p>This is a friendly reminder that payment for the following invoice is due:</p>
<table style="width: 100%; border-collapse: collapse;">
  <tr><td><strong>Invoice Number:</strong></td><td>{{invoice_number}}</td></tr>
  <tr><td><strong>Amount Due:</strong></td><td>₹{{amount}}</td></tr>
  <tr><td><strong>Due Date:</strong></td><td>{{due_date}}</td></tr>
  <tr><td><strong>Days Overdue:</strong></td><td>{{days_overdue}}</td></tr>
</table>
<p>Please make the payment at your earliest convenience.</p>
<p>If you have already made the payment, please ignore this email.</p>
<p>Best regards,<br>{{company_name}}</p>',
'["company_name", "customer_name", "invoice_number", "amount", "due_date", "days_overdue"]', 'finance', true),

(NULL, 'Employee Welcome', 'employee-welcome', 'Welcome to {{company_name}}!',
'<h2>Welcome to the Team!</h2>
<p>Hi {{employee_name}},</p>
<p>We are thrilled to welcome you to {{company_name}}!</p>
<p>Here are your account details:</p>
<table style="width: 100%; border-collapse: collapse;">
  <tr><td><strong>Email:</strong></td><td>{{employee_email}}</td></tr>
  <tr><td><strong>Department:</strong></td><td>{{department}}</td></tr>
  <tr><td><strong>Manager:</strong></td><td>{{manager_name}}</td></tr>
  <tr><td><strong>Start Date:</strong></td><td>{{start_date}}</td></tr>
</table>
<p>Login to Vyapar360 to access your profile and start your journey with us!</p>
<p>Best regards,<br>HR Team<br>{{company_name}}</p>',
'["company_name", "employee_name", "employee_email", "department", "manager_name", "start_date"]', 'hr', true);
