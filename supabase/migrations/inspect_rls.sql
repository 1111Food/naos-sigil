-- Check current policies on protocol_daily_logs
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'protocol_daily_logs';

-- Also check table definition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'protocol_daily_logs';
