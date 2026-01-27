-- =====================================================
-- DEVOPOD ERP - COMPREHENSIVE DATABASE SCHEMA
-- Multi-tenant SaaS ERP + Marketplace Platform
-- =====================================================

-- =====================================================
-- PART 1: PLATFORM LEVEL TABLES
-- =====================================================

-- COMPANIES (Tenants)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  industry VARCHAR(100),
  description TEXT,
  logo TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(20),
  gstin VARCHAR(50),
  pan VARCHAR(20),
  established_year INTEGER,
  employee_count VARCHAR(50),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INDUSTRIES (for categorization)
CREATE TABLE IF NOT EXISTS industries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  description TEXT
);

INSERT INTO industries (name, icon) VALUES
  ('IT & Software', '💻'),
  ('Manufacturing', '🏭'),
  ('Healthcare', '🏥'),
  ('Education', '📚'),
  ('Retail', '🛒'),
  ('Construction', '🏗️'),
  ('Finance & Banking', '🏦'),
  ('Real Estate', '🏢'),
  ('Consulting', '💼'),
  ('Hospitality', '🏨'),
  ('Transportation', '🚚'),
  ('Agriculture', '🌾'),
  ('Other', '📋')
ON CONFLICT DO NOTHING;

-- ROLES (Updated with new roles)
DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_company_role BOOLEAN DEFAULT TRUE
);

INSERT INTO roles (name, description, is_company_role) VALUES
  ('platform_admin', 'Platform administrator - manages entire system', FALSE),
  ('customer', 'Public customer - browses and contacts companies', FALSE),
  ('company_admin', 'Company owner/admin - full access to company', TRUE),
  ('hr_manager', 'HR manager - manages employees, attendance, leaves', TRUE),
  ('finance_manager', 'Finance manager - manages invoices, payments, accounts', TRUE),
  ('project_manager', 'Project manager - manages projects and tasks', TRUE),
  ('inventory_manager', 'Inventory manager - manages stock and products', TRUE),
  ('sales_manager', 'Sales manager - manages leads and customers', TRUE),
  ('employee', 'Regular employee - self-service access only', TRUE)
ON CONFLICT (name) DO NOTHING;

-- USERS (Updated with company_id)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_joining DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- =====================================================
-- PART 2: HR MODULE TABLES
-- =====================================================

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- DESIGNATIONS
CREATE TABLE IF NOT EXISTS designations (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(20) DEFAULT 'present', -- present, absent, half_day, leave, holiday
  work_hours NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- LEAVE TYPES
CREATE TABLE IF NOT EXISTS leave_types (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- Casual Leave, Sick Leave, etc.
  days_per_year INTEGER DEFAULT 12,
  is_paid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id INTEGER REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- HOLIDAYS
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SALARY STRUCTURE
CREATE TABLE IF NOT EXISTS salary_structures (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  basic_salary NUMERIC(15,2) NOT NULL,
  hra NUMERIC(15,2) DEFAULT 0,
  da NUMERIC(15,2) DEFAULT 0,
  ta NUMERIC(15,2) DEFAULT 0,
  other_allowances NUMERIC(15,2) DEFAULT 0,
  pf_deduction NUMERIC(15,2) DEFAULT 0,
  tax_deduction NUMERIC(15,2) DEFAULT 0,
  other_deductions NUMERIC(15,2) DEFAULT 0,
  net_salary NUMERIC(15,2) NOT NULL,
  effective_from DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PAYSLIPS
CREATE TABLE IF NOT EXISTS payslips (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  working_days INTEGER,
  present_days INTEGER,
  leave_days INTEGER,
  gross_salary NUMERIC(15,2) NOT NULL,
  total_deductions NUMERIC(15,2) DEFAULT 0,
  net_salary NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, generated, paid
  paid_on DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- =====================================================
-- PART 3: INVENTORY MODULE TABLES
-- =====================================================

-- PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES product_categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES product_categories(id),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  unit VARCHAR(50) DEFAULT 'pcs', -- pcs, kg, ltr, etc.
  cost_price NUMERIC(15,2) DEFAULT 0,
  selling_price NUMERIC(15,2) DEFAULT 0,
  current_stock NUMERIC(15,2) DEFAULT 0,
  min_stock_level NUMERIC(15,2) DEFAULT 0,
  max_stock_level NUMERIC(15,2),
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- in, out, adjustment
  quantity NUMERIC(15,2) NOT NULL,
  reference_type VARCHAR(50), -- purchase_order, sale, adjustment
  reference_id INTEGER,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  po_number VARCHAR(50) NOT NULL,
  vendor_id INTEGER REFERENCES vendors(id),
  order_date DATE NOT NULL,
  expected_date DATE,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, received, cancelled
  total_amount NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- PURCHASE ORDER ITEMS
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity NUMERIC(15,2) NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  total_price NUMERIC(15,2) NOT NULL,
  received_quantity NUMERIC(15,2) DEFAULT 0
);

-- =====================================================
-- PART 4: CRM / LEADS MODULE
-- =====================================================

-- LEADS
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(50), -- website, referral, social_media, etc.
  status VARCHAR(20) DEFAULT 'new', -- new, contacted, qualified, proposal, won, lost
  assigned_to INTEGER REFERENCES users(id),
  expected_value NUMERIC(15,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LEAD ACTIVITIES
CREATE TABLE IF NOT EXISTS lead_activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- call, email, meeting, note
  description TEXT,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 5: PROJECT MODULE ENHANCEMENTS
-- =====================================================

-- Add company_id to existing projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INTEGER REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(20) DEFAULT 'todo', -- todo, in_progress, review, done
  due_date DATE,
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2) DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- TASK COMMENTS
CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- TIME LOGS
CREATE TABLE IF NOT EXISTS time_logs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES tasks(id),
  user_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MILESTONES
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, achieved
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 6: FINANCE ENHANCEMENTS
-- =====================================================

-- Add company_id to existing finance tables
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);

-- EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  submitted_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- BUDGETS
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 7: CUSTOMER MARKETPLACE
-- =====================================================

-- CONTACT REQUESTS (Customers contacting companies)
CREATE TABLE IF NOT EXISTS contact_requests (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  service_type VARCHAR(100),
  budget_range VARCHAR(50),
  urgency VARCHAR(20) DEFAULT 'normal', -- normal, urgent
  status VARCHAR(20) DEFAULT 'pending', -- pending, viewed, replied, accepted, rejected, closed
  replied_at TIMESTAMP,
  replied_by INTEGER REFERENCES users(id),
  reply_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- COMPANY REVIEWS
CREATE TABLE IF NOT EXISTS company_reviews (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- COMPANY SERVICES (What companies offer)
CREATE TABLE IF NOT EXISTS company_services (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_range VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SAVED COMPANIES (Customer favorites)
CREATE TABLE IF NOT EXISTS saved_companies (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, company_id)
);

-- =====================================================
-- PART 8: COMMUNICATION & NOTIFICATIONS
-- =====================================================

-- CHAT CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  contact_request_id INTEGER REFERENCES contact_requests(id),
  customer_id INTEGER REFERENCES users(id),
  company_id INTEGER REFERENCES companies(id),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id),
  sender_type VARCHAR(20) NOT NULL, -- customer, company
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- contact_request, message, approval, reminder
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 9: MEETINGS & CALENDAR
-- =====================================================

-- MEETINGS (with Zoom/Meet links)
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_type VARCHAR(20) DEFAULT 'online', -- online, in_person
  meeting_link VARCHAR(500), -- Zoom/Google Meet link
  location VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  organizer_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

-- MEETING PARTICIPANTS
CREATE TABLE IF NOT EXISTS meeting_participants (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  response VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 10: DOCUMENTS
-- =====================================================

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  folder VARCHAR(100),
  entity_type VARCHAR(50), -- project, invoice, employee, etc.
  entity_id INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PART 11: SETTINGS & CONFIGURATION
-- =====================================================

-- COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  currency VARCHAR(10) DEFAULT 'INR',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  fiscal_year_start INTEGER DEFAULT 4, -- April
  invoice_prefix VARCHAR(20) DEFAULT 'INV-',
  po_prefix VARCHAR(20) DEFAULT 'PO-',
  tax_enabled BOOLEAN DEFAULT TRUE,
  tax_percentage NUMERIC(5,2) DEFAULT 18.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_company ON attendance(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_company ON contact_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_customer ON contact_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);

-- =====================================================
-- PART 12: AI BOT CONVERSATION HISTORY
-- =====================================================

-- BOT MESSAGES (Per-user conversation history)
CREATE TABLE IF NOT EXISTS bot_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL, -- 'user' or 'bot'
  content TEXT NOT NULL,
  intent VARCHAR(50),
  data_insight TEXT,
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_messages_user ON bot_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_created ON bot_messages(user_id, created_at DESC);
