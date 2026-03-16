import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avaikhukgugvcocwedsz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWlraHVrZ3VndmNvY3dlZHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTEyNTIsImV4cCI6MjA4MzcyNzI1Mn0.hslPEVgg-gkk3ByYvZGEwFf7B3kdwhwXQipr1D_8ruo';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Intention persistence will be disabled.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);