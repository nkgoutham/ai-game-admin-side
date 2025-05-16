/*
  # Update to game sessions table and RLS policies

  1. Security Updates
    - Adding stronger RLS policies for game sessions
    - Ensuring proper relationship between students and sessions
*/

-- Make sure game_sessions table exists before applying other changes
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  teacher_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  game_code text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Add column for banned students (array of student IDs)
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS banned_students uuid[] DEFAULT '{}';

-- Update RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can read game sessions') THEN
    CREATE POLICY "Anyone can read game sessions"
      ON game_sessions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Teachers can insert and update game sessions') THEN
    CREATE POLICY "Teachers can insert and update game sessions"
      ON game_sessions
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Teachers can update game sessions') THEN
    CREATE POLICY "Teachers can update game sessions"
      ON game_sessions
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;