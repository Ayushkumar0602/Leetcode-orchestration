import { createClient } from '@supabase/supabase-js';

// Fallback to the known credentials if env variables are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vnnkhcqswoeqnghztpvh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkxODg5MiwiZXhwIjoyMDg4NDk0ODkyfQ.1t1U_yv6lloUu_Tgp-Mh7GgC_3ugH-RN34SrZNXvuyU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
