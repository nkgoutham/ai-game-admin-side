/*
  # Update students table schema
  
  This migration ensures the students table has the required status column,
  but only adds it if it doesn't already exist in the schema.
*/

-- Add the status column to the students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'status'
  ) THEN
    ALTER TABLE students ADD COLUMN status TEXT DEFAULT 'waiting';
    
    -- Only add the constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'students_status_check'
    ) THEN
      ALTER TABLE students 
      ADD CONSTRAINT students_status_check 
      CHECK (status IS NULL OR status = ANY (ARRAY['waiting'::text, 'playing'::text, 'completed'::text]));
    END IF;
  END IF;
END $$;