import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://wyyqklkmkoixtzkhevrs.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eXFrbGtta29peHR6a2hldnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTc0NDQsImV4cCI6MjA4NjA3MzQ0NH0.iKLckSSLNLISXotggLoTPHs047TVDkzFrf0DhK6JepU';

/**
 * A safe storage adapter that handles SSR (server-side rendering) gracefully.
 * During SSR on web, `window` is not defined, so AsyncStorage would crash.
 * This adapter returns no-op stubs during SSR and delegates to AsyncStorage
 * at runtime on native / client-side web.
 */
const SafeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return null;
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return;
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return;
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Google Cloud Vision API key for recyclability analysis
export const GOOGLE_VISION_API_KEY = 'AIzaSyDzIM-Amd0kyvGiG2mKdvQUlocwSYRacsM';

// Same Google Cloud project key — also used for Places API (Nearby Search)
// Requires "Places API" to be enabled in the Google Cloud Console.
export const GOOGLE_PLACES_API_KEY = GOOGLE_VISION_API_KEY;
