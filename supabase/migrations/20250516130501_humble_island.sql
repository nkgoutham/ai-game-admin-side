/*
  # Update user role to teacher

  1. Changes
    - Update the role of the specific user with UUID 073a9155-be4f-429c-8300-ac2ee2281140 from 'player' to 'teacher'
  
  2. Security
    - No RLS changes
*/

-- Update user role from player to teacher for the specific user
UPDATE profiles
SET role = 'teacher'
WHERE id = '073a9155-be4f-429c-8300-ac2ee2281140'
AND role = 'player';

-- Log the change (optional, helps with auditing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = '073a9155-be4f-429c-8300-ac2ee2281140'
    AND role = 'teacher'
  ) THEN
    RAISE NOTICE 'User 073a9155-be4f-429c-8300-ac2ee2281140 role updated to teacher';
  ELSE
    RAISE NOTICE 'User 073a9155-be4f-429c-8300-ac2ee2281140 not found or already has teacher role';
  END IF;
END $$;