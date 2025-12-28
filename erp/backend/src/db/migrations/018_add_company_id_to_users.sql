-- Migration: Add company_id and is_active to users table
-- This enables proper multi-tenant user management

-- Add company_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);

-- Add is_active column for user status management
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for faster company-based queries
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Update existing users who are linked through employees table
UPDATE users u
SET company_id = e.company_id
FROM employees e
WHERE e.user_id = u.id AND u.company_id IS NULL;
