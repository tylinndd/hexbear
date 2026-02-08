-- =============================================
-- Hexbear Database Schema
-- Run this in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- =============================================

-- Profiles table (extends the auth.users table)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  wizard_name TEXT NOT NULL,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title TEXT DEFAULT 'Novice EcoMage',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions table (logs all eco-actions: recycle, energy, donate)
CREATE TABLE IF NOT EXISTS actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('recycle', 'energy', 'donate')),
  details JSONB,
  points_awarded INTEGER NOT NULL,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Leaderboard: all authenticated users can see all profiles (for leaderboard)
CREATE POLICY "All users can view leaderboard data"
  ON profiles FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for actions
CREATE POLICY "Users can view their own actions"
  ON actions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
  ON actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Storage Setup (run separately if needed)
-- =============================================
-- In the Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create a bucket called 'photos' (set to private)
-- 3. Then run these policies:

-- CREATE POLICY "Users can upload their own photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can view their own photos"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'photos'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );
