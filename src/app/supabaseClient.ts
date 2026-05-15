import { createClient } from '@supabase/supabase-js';

// Твои данные для подключения к Supabase
const supabaseUrl = 'https://nokazhrmlbctyttovpsa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5va2F6aHJtbGJjdHl0dG92cHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzE2OTMsImV4cCI6MjA5NDQ0NzY5M30.RCN-wRysyxvJe3cl8b3b_SQUmiENM3NQHNwqhTAruc4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);