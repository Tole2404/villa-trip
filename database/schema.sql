-- Database Schema for Villa Trip Manager
-- Run this in your Vercel Postgres / Neon database

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  target_amount INTEGER NOT NULL DEFAULT 0,
  dp_amount INTEGER NOT NULL DEFAULT 0,
  dp_paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('dp', 'savings', 'full')),
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);

-- View for member statistics
CREATE OR REPLACE VIEW member_stats AS
SELECT 
  m.*,
  COALESCE(SUM(p.amount), 0) as total_paid,
  m.target_amount - COALESCE(SUM(p.amount), 0) as remaining,
  CASE 
    WHEN COALESCE(SUM(p.amount), 0) >= m.target_amount THEN 'completed'
    WHEN COALESCE(SUM(p.amount), 0) > m.dp_amount AND m.dp_amount > 0 THEN 'savings'
    WHEN COALESCE(SUM(p.amount), 0) >= m.dp_amount AND m.dp_amount > 0 THEN 'dp_only'
    ELSE 'pending'
  END as status
FROM members m
LEFT JOIN payments p ON m.id = p.member_id
GROUP BY m.id;
