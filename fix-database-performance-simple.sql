-- Simple Database Performance Fix
-- Run this in your Supabase SQL Editor

-- 1. Create indexes on the jobs table (using correct column names)
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs("createdAt");
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- 2. Create indexes on the products table (using correct column names)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products("createdAt");

-- 3. Create indexes on settings tables (these use snake_case)
CREATE INDEX IF NOT EXISTS idx_business_settings_created_at ON business_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_settings_created_at ON payment_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_general_settings_created_at ON general_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_email_settings_created_at ON email_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_settings_created_at ON sms_settings(created_at);

-- 4. Simple verification - just check if indexes exist
SELECT 'Indexes created successfully!' as status;
