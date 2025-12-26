-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    type VARCHAR(50) DEFAULT 'meeting', -- meeting, task, reminder, holiday
    color VARCHAR(20) DEFAULT '#8b5cf6',
    is_all_day BOOLEAN DEFAULT false,
    is_company_wide BOOLEAN DEFAULT false,
    reminder_minutes INTEGER,
    recurrence VARCHAR(50), -- none, daily, weekly, monthly, yearly
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_company ON calendar_events(company_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
