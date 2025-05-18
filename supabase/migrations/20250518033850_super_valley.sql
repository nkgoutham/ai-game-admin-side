/**
 * Migration file to fix game_sessions structure and policies
 */

/*
# Game Sessions Table Update

1. Structure
  - Ensures game_sessions table exists with correct structure
  - Adds banned_students array column for managing banned players

2. Security
  - Fixes RLS policies for game_sessions
  - Creates proper policies for read, insert, and update permissions

3. Changes
  - Drops and recreates policies to ensure correct syntax
  - Uses correct policy definitions compatible with Supabase
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
  banned_students uuid[] DEFAULT '{}'::uuid[]
);

-- Make sure RLS is enabled
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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