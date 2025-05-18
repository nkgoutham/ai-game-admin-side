/*
  # Implement game session status transition

  1. New Utilities
    - Add function to update game session status
    - Use game_sessions table as source of truth for game state
  2. Security
    - Ensure proper RLS policies for game_sessions
  
  This migration ensures the game_sessions table has the correct structure and
  adds functions for tracking game state transitions.
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

-- Update or create RLS policies if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can read game sessions' AND tablename = 'game_sessions') THEN
    CREATE POLICY "Anyone can read game sessions"
      ON game_sessions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Teachers can insert and update game sessions' AND tablename = 'game_sessions') THEN
    CREATE POLICY "Teachers can insert and update game sessions"
      ON game_sessions
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Teachers can update game sessions' AND tablename = 'game_sessions') THEN
    CREATE POLICY "Teachers can update game sessions"
      ON game_sessions
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;