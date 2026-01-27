-- Email Integrations Schema
-- Add to database

CREATE TABLE IF NOT EXISTS email_integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL DEFAULT 'gmail', -- gmail, outlook
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expiry_date TIMESTAMP,
    email_address VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider)
);

-- Email sync history (for tracking synced emails)
CREATE TABLE IF NOT EXISTS synced_emails (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES email_integrations(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL, -- Gmail message ID
    thread_id VARCHAR(255),
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    direction VARCHAR(10) NOT NULL, -- inbound, outbound
    subject VARCHAR(500),
    snippet TEXT,
    from_email VARCHAR(255),
    to_email VARCHAR(255),
    email_date TIMESTAMP,
    is_read BOOLEAN DEFAULT false,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_email_integrations_user ON email_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_integration ON synced_emails(integration_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_contact ON synced_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_lead ON synced_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_synced_emails_customer ON synced_emails(customer_id);
