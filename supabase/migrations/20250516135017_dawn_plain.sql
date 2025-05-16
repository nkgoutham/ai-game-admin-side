/*
  # Update students table to make session_id nullable
  
  1. Changes
     - Make session_id column in students table nullable
     - This allows students to join without requiring a valid game session
     
  2. Why this change
     - Simplifies the player joining process
     - Removes dependency on game sessions for student registration
*/

-- Modify the students table to make session_id nullable
ALTER TABLE students
ALTER COLUMN session_id DROP NOT NULL;