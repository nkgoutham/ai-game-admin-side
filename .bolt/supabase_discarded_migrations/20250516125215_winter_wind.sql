/*
  # Enable Row Level Security (RLS) on all tables

  1. Security
    - Enable RLS on all tables
    - Create auth policies for each table
*/

-- Enable RLS on all tables
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers to access all data
CREATE POLICY "Teachers can read all data" 
ON chapters FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Teachers can insert chapters" 
ON chapters FOR INSERT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Teachers can update chapters" 
ON chapters FOR UPDATE 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Teachers can delete chapters" 
ON chapters FOR DELETE 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

-- Create similar policies for other tables
CREATE POLICY "Teachers can read topics" 
ON topic_details FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Teachers can manage topics" 
ON topic_details FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Teachers can read questions" 
ON questions FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Teachers can manage questions" 
ON questions FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Teachers can manage game sessions" 
ON game_sessions FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Anyone can read active game sessions" 
ON game_sessions FOR SELECT 
USING (status = 'in_progress');

CREATE POLICY "Teachers can read all students" 
ON students FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Players can read their own data" 
ON students FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Players can insert their data" 
ON students FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Teachers can read all responses" 
ON responses FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'teacher');

CREATE POLICY "Players can read their own responses" 
ON responses FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM students 
  WHERE students.id = responses.student_id 
  AND students.id = auth.uid()
));

CREATE POLICY "Players can insert their responses" 
ON responses FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM students 
  WHERE students.id = responses.student_id 
  AND students.id = auth.uid()
));