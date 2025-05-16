/*
  # Add status column to students table

  1. Changes
    - Adds a 'status' column to the 'students' table
    - Column type is text with a default value of 'waiting'
    - The status column will be used to track student participation status in game sessions
    
  2. Purpose
    - Fixes errors when adding students to sessions
    - Enables student status tracking functionality
*/

-- Add status column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'waiting';

-- Create an index on the status column for better query performance
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- Ensure any existing records have the default status
UPDATE students 
SET status = 'waiting' 
WHERE status IS NULL;