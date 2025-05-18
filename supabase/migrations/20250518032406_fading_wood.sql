/*
  # Game Sessions Table Migration
  
  1. New Tables
    - Creates game_sessions table if it doesn't exist with proper structure
  2. Security
    - Enables RLS on game_sessions table
    - Adds policies for authenticated users to read, insert, and update game sessions
*/

-- First ensure the table exists with proper structure
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  teacher_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  game_code text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  banned_students uuid[] DEFAULT '{}'
);

-- Make sure RLS is enabled
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can read game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Teachers can insert and update game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Teachers can update game sessions" ON game_sessions;

-- Create policies
CREATE POLICY "Anyone can read game sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert and update game sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update game sessions"
  ON game_sessions
  FOR UPDATE
  TO authenticated
  USING (true);