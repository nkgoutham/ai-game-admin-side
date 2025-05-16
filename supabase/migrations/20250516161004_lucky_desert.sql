/*
  # Add game_sessions table
  
  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `chapter_id` (uuid, foreign key to chapters)
      - `teacher_name` (text)
      - `status` (text, with constraints)
      - `game_code` (text)
      - `started_at` (timestamp)
      - `ended_at` (timestamp)
      
  2. Security
    - Enable RLS on `game_sessions` table
    - Add policies for authenticated users
*/

-- Create game sessions table
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

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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