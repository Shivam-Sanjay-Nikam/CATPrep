-- ==========================================
-- RESET SCHEMA
-- Warning: This drops all existing tables and their data!
-- ==========================================
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.test_questions CASCADE;
DROP TABLE IF EXISTS public.lesson_questions CASCADE;
DROP TABLE IF EXISTS public.mock_tests CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;

-- Enable RLS (will apply after tables are created)
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics ENABLE ROW LEVEL SECURITY;

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  duration TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  tags TEXT[],
  lessons_count INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  reading_time TEXT DEFAULT '5 min',
  is_locked BOOLEAN DEFAULT TRUE,
  content TEXT,
  order_index INTEGER DEFAULT 0
);

-- 3. Lesson Questions Table
CREATE TABLE IF NOT EXISTS public.lesson_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0
);

-- 3. Student Progress Table
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 4. Analytics Table
CREATE TABLE IF NOT EXISTS public.analytics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_mocks_taken INTEGER DEFAULT 0,
  average_score_percentage FLOAT DEFAULT 0,
  time_per_correct_question INTEGER DEFAULT 0,
  accuracy_rate FLOAT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES

-- Courses & Lessons: Everyone (authenticated) can read
CREATE POLICY "Courses are viewable by everyone" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Lessons are viewable by everyone" ON public.lessons
  FOR SELECT USING (true);

-- Student Progress: Users can only see/edit their own
CREATE POLICY "Users can view own progress" ON public.student_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.student_progress
  FOR ALL USING (auth.uid() = user_id);

-- Analytics: Users can only see/edit their own
CREATE POLICY "Users can view own analytics" ON public.analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON public.analytics
  FOR ALL USING (auth.uid() = user_id);

-- SEED DATA (Optional, based on mock data)
INSERT INTO public.courses (id, title, description, instructor, duration, difficulty, tags, lessons_count, price, thumbnail)
VALUES 
('alg-101', 'Advanced Number Systems & Algebra', 'Master the core pillars of the CAT quant section...', 'Alumni, IIM Ahmedabad', '40 Hours', 'Advanced', ARRAY['Quant', 'Algebra', 'High Probability'], 24, 0, '/images/algebra_thumb.png'),
('log-101', 'Critical Reasoning Foundations', 'Build the logical framework required...', 'Alumni, IIM Bangalore', '30 Hours', 'Intermediate', ARRAY['VARC', 'Logic', 'Strategy'], 18, 0, '/images/logic_thumb.png');

INSERT INTO public.lessons (id, course_id, title, duration, reading_time, is_locked, content, order_index)
VALUES 
('l1', 'alg-101', 'Introduction to Prime Numbers', '45m', '12 min', false, null, 1),
('l2', 'alg-101', 'Modular Arithmetic', '1h 15m', '15 min', false, null, 2),
('l3', 'alg-101', 'Quadratic Equations', '55m', '20 min', true, null, 3);

-- SEED DATA (Optional, based on mock data)
-- ... [kept from before]

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'course-assets');

CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'course-assets' AND 
  (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
);

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'course-assets' AND 
  (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
);

-- EXTENDED CMS RLS POLICIES
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT 
WITH CHECK (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update courses" ON public.courses FOR UPDATE 
USING (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE 
USING (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL 
USING (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can manage questions" ON public.lesson_questions FOR ALL 
USING (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Everyone can view questions" ON public.lesson_questions FOR SELECT 
USING (true);

-- 5. Mock Tests Table
CREATE TABLE IF NOT EXISTS public.mock_tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  total_questions INTEGER DEFAULT 66,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Mock Test Questions Table
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id TEXT REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  subject TEXT,
  difficulty TEXT,
  order_index INTEGER DEFAULT 0
);

-- Enable RLS for Mock Tests
ALTER TABLE IF EXISTS public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_questions ENABLE ROW LEVEL SECURITY;

-- Mock Tests RLS Policies
CREATE POLICY "Mock tests are viewable by everyone" ON public.mock_tests
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage mock tests" ON public.mock_tests FOR ALL 
USING (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Test Questions RLS Policies
CREATE POLICY "Test questions are viewable by everyone" ON public.test_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage test questions" ON public.test_questions FOR ALL 
USING (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 7. Test Attempts Table (stores user results)
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_test_id TEXT REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',      -- { questionId: selectedIndex }
  score INTEGER NOT NULL DEFAULT 0,         -- raw score (correct - 0.33 * wrong)
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_wrong INTEGER NOT NULL DEFAULT 0,
  total_unattempted INTEGER NOT NULL DEFAULT 0,
  score_percentage FLOAT NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE IF EXISTS public.test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts" ON public.test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON public.test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.test_attempts
  FOR ALL USING (auth.email() = 'shivamsanjaynikam17112002@gmail.com' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

