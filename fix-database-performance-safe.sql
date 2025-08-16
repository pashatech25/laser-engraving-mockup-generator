-- Safe Database Performance Fix
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what columns actually exist
SELECT 'jobs table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY column_name;

SELECT 'products table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY column_name;

-- 2. Check if indexes already exist
SELECT 'Existing indexes:' as info;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('jobs', 'products', 'business_settings', 'payment_settings', 'general_settings', 'email_settings', 'sms_settings')
ORDER BY tablename, indexname;

-- 3. Create indexes only if columns exist (we'll do this after seeing the actual structure)
-- The actual CREATE INDEX commands will be added after we see the real column names
