import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://wyyqklkmkoixtzkhevrs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eXFrbGtta29peHR6a2hldnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTc0NDQsImV4cCI6MjA4NjA3MzQ0NH0.iKLckSSLNLISXotggLoTPHs047TVDkzFrf0DhK6JepU';

// Google Cloud Vision API key for recyclability analysis
export const GOOGLE_VISION_API_KEY = 'AIzaSyDzIM-Amd0kyvGiG2mKdvQUlocwSYRacsM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // important for React Native (no browser URL)
  },
});
