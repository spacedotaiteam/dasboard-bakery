
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://qyqedcxxebiceujxgbhp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cWVkY3h4ZWJpY2V1anhnYmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTIzMjgsImV4cCI6MjA3ODk4ODMyOH0.d7gAaJVziEUsO-_bjPgQ7glEfU8RyrNaRqhmDXamKYA';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
