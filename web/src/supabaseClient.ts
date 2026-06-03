import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tekbwxsifigakxcufaww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla2J3eHNpZmlnYWt4Y3VmYXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzA5NDEsImV4cCI6MjA5NjA0Njk0MX0.YXnXyx-dhrIdoY1ncI8ht6DQ31T3wX9cYbMDj66_muI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
