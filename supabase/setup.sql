-- ============================================
-- Diamond Manager — Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. People Table
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Diamond Types Table
CREATE TABLE IF NOT EXISTS diamond_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  shape TEXT,
  size TEXT,
  quality TEXT,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Money Transactions Table
CREATE TABLE IF NOT EXISTS money_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Diamond Transactions Table
CREATE TABLE IF NOT EXISTS diamond_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  diamond_type_id UUID NOT NULL REFERENCES diamond_types(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('given', 'received')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  weight NUMERIC(10, 2),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_transactions ENABLE ROW LEVEL SECURITY;

-- People policies
CREATE POLICY "Users can view their own people"
  ON people FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own people"
  ON people FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people"
  ON people FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people"
  ON people FOR DELETE
  USING (auth.uid() = user_id);

-- Diamond types policies
CREATE POLICY "Users can view their own diamond_types"
  ON diamond_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diamond_types"
  ON diamond_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diamond_types"
  ON diamond_types FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diamond_types"
  ON diamond_types FOR DELETE
  USING (auth.uid() = user_id);

-- Money transactions policies
CREATE POLICY "Users can view their own money_transactions"
  ON money_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own money_transactions"
  ON money_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own money_transactions"
  ON money_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own money_transactions"
  ON money_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Diamond transactions policies
CREATE POLICY "Users can view their own diamond_transactions"
  ON diamond_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diamond_transactions"
  ON diamond_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diamond_transactions"
  ON diamond_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diamond_transactions"
  ON diamond_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);
CREATE INDEX IF NOT EXISTS idx_diamond_types_user_id ON diamond_types(user_id);
CREATE INDEX IF NOT EXISTS idx_money_transactions_user_id ON money_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_money_transactions_person_id ON money_transactions(person_id);
CREATE INDEX IF NOT EXISTS idx_diamond_transactions_user_id ON diamond_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_diamond_transactions_person_id ON diamond_transactions(person_id);
