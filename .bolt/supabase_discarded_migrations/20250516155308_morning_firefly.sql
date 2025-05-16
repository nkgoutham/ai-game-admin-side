/*
  # Add status column to students table

  1. Schema Changes
    - Adds a `status` column to the `students` table
    - The column accepts text values and can be null
    - This fixes the error in the application when adding students

  2. Purpose
    - Support the status tracking functionality in the application
    - Enables proper student status management (waiting, playing, completed)
*/

-- Add the status column to the students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'status'
  ) THEN
    ALTER TABLE students ADD COLUMN status TEXT;
  END IF;
END $$;

-- Add a check constraint to ensure status values are valid
ALTER TABLE students 
ADD CONSTRAINT students_status_check 
CHECK (status IS NULL OR status = ANY (ARRAY['waiting'::text, 'playing'::text, 'completed'::text]));