import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://fmcxgawnbeszoyslawik.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY3hnYXduYmVzem95c2xhd2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjA1MDgsImV4cCI6MjA4MjE5NjUwOH0.7mn_45vgKY11KqUzu5WeKvaENQ7c1m4lif-1cS1fR9A';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
    auth: {
        storage: sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
