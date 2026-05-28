// ── Supabase client configuration ────────────────────────────────────────
const SUPABASE_URL = 'https://tlfkpdvvtrwpwzqnghow.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZmtwZHZ2dHJ3cHd6cW5naG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MjAyMTcsImV4cCI6MjA5NTQ5NjIxN30.DRM0OF6jstXIC4Y_KE5EJQv2WP-4UXqPjvorSYsp3aY';

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
