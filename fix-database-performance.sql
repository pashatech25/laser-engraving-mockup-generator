-- Fix Database Performance and Column Naming Issues
-- Run this in your Supabase SQL Editor

-- 1. Add indexes to prevent timeout issues
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(createdAt);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(createdAt);

-- 2. Add indexes to settings tables for faster loading
CREATE INDEX IF NOT EXISTS idx_business_settings_created_at ON business_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_settings_created_at ON payment_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_general_settings_created_at ON general_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_email_settings_created_at ON email_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_settings_created_at ON sms_settings(created_at);

-- 3. Verify the indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('jobs', 'products', 'business_settings', 'payment_settings', 'general_settings', 'email_settings', 'sms_settings')
ORDER BY tablename, indexname;

-- 4. Check current table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE tablename IN ('jobs', 'products', 'business_settings', 'payment_settings', 'general_settings', 'email_settings', 'sms_settings')
ORDER BY tablename;
