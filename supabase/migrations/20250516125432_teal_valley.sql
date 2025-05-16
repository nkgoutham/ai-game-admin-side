/*
  # Update game_sessions table for multiplayer functionality

  1. Changes
    - Add game_code column to game_sessions table
    - Add indexes for efficient lookups
*/

-- Add game_code column to game_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'game_code'
  ) THEN
    ALTER TABLE game_sessions ADD COLUMN game_code TEXT;
  END IF;
END $$;

-- Create index on game_code for efficient lookups
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_code ON game_sessions (game_code);

-- Create index on status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions (status);