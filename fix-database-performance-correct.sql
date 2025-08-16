-- Correct Database Performance Fix
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

-- 4. Verify all indexes were created successfully
SELECT 'Indexes created:' as info;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('jobs', 'products', 'business_settings', 'payment_settings', 'general_settings', 'email_settings', 'sms_settings')
ORDER BY tablename, indexname;

-- 5. Check table statistics to see current performance
SELECT 'Table statistics:' as info;
SELECT 
    schemaname,
    tablename,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE tablename IN ('jobs', 'products', 'business_settings', 'payment_settings', 'general_settings', 'email_settings', 'sms_settings')
ORDER BY tablename;
