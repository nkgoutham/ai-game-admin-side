/*
  # Remove game_sessions table and update references

  1. Changes
    - Remove foreign key constraints from students table
    - Drop game_sessions table
    - Update students table to work directly without session reference

  2. Security
    - No security changes needed
*/

-- First remove foreign key constraints referencing game_sessions
ALTER TABLE IF EXISTS students
DROP CONSTRAINT IF EXISTS students_session_id_fkey;

-- Drop the game_sessions table
DROP TABLE IF EXISTS game_sessions;

-- Modify students table to work without session_id
-- We'll keep the column for now but make it nullable to avoid breaking existing code
ALTER TABLE students
ALTER COLUMN session_id DROP NOT NULL;

-- Create a status column in students table to track their game state
ALTER TABLE IF EXISTS students
ADD COLUMN IF NOT EXISTS status text DEFAULT 'waiting';

-- Add a constraint for status values
ALTER TABLE students
ADD CONSTRAINT students_status_check
CHECK (status IN ('waiting', 'playing', 'completed'));