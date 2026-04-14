-- ====================================================================
-- CATPREP INITIAL SCHEMA & SEED DATA
-- Purpose: Reset -> Create -> Prepare
-- Version: 2.0 (Premium Seed Data)
-- ====================================================================

-- ==========================================
-- 1. RESET SCHEMA
-- ==========================================
DROP TABLE IF EXISTS public.test_attempts CASCADE;
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.test_questions CASCADE;
DROP TABLE IF EXISTS public.lesson_questions CASCADE;
DROP TABLE IF EXISTS public.mock_tests CASCADE;
DROP TABLE IF EXISTS public.student_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- Courses
CREATE TABLE public.courses (
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

-- Lessons
CREATE TABLE public.lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT,
  reading_time TEXT DEFAULT '5 min',
  is_locked BOOLEAN DEFAULT FALSE,
  content TEXT,
  order_index INTEGER DEFAULT 0
);

-- Practice questions within lessons
CREATE TABLE public.lesson_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 0
);

-- User progress tracking
CREATE TABLE public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_lessons INTEGER DEFAULT 0,
  completed_lesson_ids TEXT[] DEFAULT '{}',
  total_lessons INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Global analytics
CREATE TABLE public.analytics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_mocks_taken INTEGER DEFAULT 0,
  average_score_percentage FLOAT DEFAULT 0,
  time_per_correct_question INTEGER DEFAULT 0,
  accuracy_rate FLOAT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mock Tests
CREATE TABLE public.mock_tests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  total_questions INTEGER DEFAULT 66,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mock Test Questions
CREATE TABLE public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id TEXT REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  subject TEXT CHECK (subject IN ('Quant', 'LRDI', 'VARC')),
  difficulty TEXT CHECK (difficulty IN ('Low', 'Medium', 'High')),
  order_index INTEGER DEFAULT 0
);

-- Test Attempts
CREATE TABLE public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_test_id TEXT REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_wrong INTEGER NOT NULL DEFAULT 0,
  total_unattempted INTEGER NOT NULL DEFAULT 0,
  score_percentage FLOAT NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NOTE: RLS Disabling as requested
-- We are NOT enabling RLS on these tables for easy development/seeding.

-- ==========================================
-- 3. PREPARE SEED DATA
-- ==========================================

-- 3.1 Courses
INSERT INTO public.courses (id, title, description, instructor, duration, difficulty, tags, lessons_count, price, thumbnail)
VALUES 
('quant-mastery', 'Quantitative Aptitude Masterclass', 'Master Arithmetic, Algebra, Geometry and Modern Math with our flagship course.', 'IIM Ahmedabad Alumni', '60 Hours', 'Intermediate', ARRAY['Quant', 'Arithmetic', 'CAT 2024'], 3, 0, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'),
('varc-elite', 'VARC Strategic Excellence', 'Intensive training on Reading Comprehension, Critical Reasoning and Verbal Ability.', 'IIM Bangalore Mentor', '45 Hours', 'Intermediate', ARRAY['VARC', 'Reading', 'Verbal'], 2, 0, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'),
('dilr-logic', 'DILR Logical Puzzles & Data', 'Unlock the secrets of solving complex DILR sets under pressure.', 'IIM Calcutta Specialist', '40 Hours', 'Advanced', ARRAY['LRDI', 'Logic', 'DI'], 2, 0, 'https://images.unsplash.com/photo-1509228468518-180dd482195e?auto=format&fit=crop&q=80&w=800');

-- 3.2 Lessons for Courses (Enriched)
INSERT INTO public.lessons (id, course_id, title, duration, reading_time, is_locked, content, order_index)
VALUES 
('q-l1', 'quant-mastery', 'Percentages & Applications', '1h 20m', '15 min', false, '
  <h2>Mastering Percentages</h2>
  <p>Percentages are the foundation of Arithmetic. In CAT, you''ll rarely see a direct question on percentages, but they are embedded in Profit & Loss, SI-CI, and Data Interpretation.</p>
  <h3>Key Concepts:</h3>
  <ul>
    <li><strong>Fractional Equivalents:</strong> 1/7 = 14.28%, 1/9 = 11.11%, 1/11 = 9.09%. Memorizing these saves 30 seconds per question.</li>
    <li><strong>Successive Percentage Changes:</strong> Use the formula a + b + ab/100 for quick calculations.</li>
  </ul>
  <div style="padding: 1rem; background: var(--surface-container-high); border-radius: 8px; margin: 1rem 0;">
    <strong>Pro-Tip:</strong> To increase a number by 37.5%, simply multiply it by 11/8 (since 37.5% = 3/8).
  </div>
', 1),
('q-l2', 'quant-mastery', 'Averages & Mixtures', '1h 45m', '20 min', false, '
  <h2>Averages, Mixtures & Allegations</h2>
  <p>Average is the central value of a data set. Allegations is not a topic, but a *technique* to solve weighted average problems faster.</p>
  <h3>Weighted Average Formula:</h3>
  <p><code>(n1*a1 + n2*a2) / (n1 + n2)</code></p>
  <p>Use the allegation cross-method whenever you see two groups combining to form a third group with a specific average.</p>
', 2),
('q-l3', 'quant-mastery', 'Quadratic Equations', '2h', '25 min', false, '
  <h2>Quadratic Equations & Polynomials</h2>
  <p>Algebra in CAT revolves around understanding the nature of roots. A quadratic equation ax² + bx + c = 0 has roots given by the quadratic formula.</p>
  <h3>Nature of Roots (The Discriminant):</h3>
  <ul>
    <li>D > 0: Real and Distinct roots.</li>
    <li>D = 0: Real and Equal roots.</li>
    <li>D < 0: Imaginary roots.</li>
  </ul>
', 3),
('v-l1', 'varc-elite', 'RC Strategy: Tone & Style', '1h', '30 min', false, '
  <h2>Decoding Author Tone</h2>
  <p>Reading Comprehension (RC) is 70% of the VARC section. Identifying the author''s tone is crucial for "Main Idea" and "Author''s Perspective" questions.</p>
  <h3>Common Tones:</h3>
  <ul>
    <li><strong>Acerbic:</strong> Sharp and forthright; biting.</li>
    <li><strong>Didactic:</strong> Intended to teach, particularly in having moral instruction as an ulterior motive.</li>
    <li><strong>Dogmatic:</strong> Laying down principles as incontrovertibly true.</li>
  </ul>
', 1),
('v-l2', 'varc-elite', 'Parajumbles & Odd One Out', '1h 30m', '15 min', false, '
  <h2>Verbal Ability Mastering</h2>
  <p>Parajumbles require you to find "mandatory pairs." Look for pronouns, transition words (however, furthermore), and chronological markers.</p>
', 2),
('d-l1', 'dilr-logic', 'Linear & Circular Arrangements', '2h 15m', '40 min', false, '
  <h2>Logical Arrangements</h2>
  <p>Seating arrangements are a staple of DILR. The key is to distinguish between "Fixed Information" and "Variable Information."</p>
  <div style="background: #fdf2f2; padding: 1rem; border-left: 4px solid #f87171; border-radius: 4px;">
    <strong>Warning:</strong> In circular arrangements, "Left" and "Right" depend on whether people are facing inside or outside the circle.
  </div>
', 1),
('d-l2', 'dilr-logic', 'Games and Tournaments', '2h 30m', '45 min', false, '
  <h2>Games & Tournaments Logic</h2>
  <p>These sets often involve knock-out tournaments or round-robin formats. You must track the number of wins/losses to determine the leaderboard.</p>
', 2);

-- 3.2.1 Lesson Practice Questions
INSERT INTO public.lesson_questions (lesson_id, question_text, options, correct_index, explanation, order_index)
VALUES 
('q-l1', 'If price of sugar increases by 25%, by what percentage should a household decrease consumption to keep expenditure constant?', ARRAY['20%', '25%', '16.66%', '33.33%'], 0, '1/4 increase requires 1/5 decrease (20%). Formula: r/(100+r) * 100', 1),
('q-l1', 'What is the fraction equivalent of 83.33%?', ARRAY['5/6', '4/5', '7/8', '11/12'], 0, '100% - 16.66% = 1 - 1/6 = 5/6.', 2),
('q-l2', 'Average of 5 numbers is 20. If a 6th number 32 is added, what is the new average?', ARRAY['22', '24', '20', '26'], 0, '(5*20 + 32) / 6 = 132 / 6 = 22.', 1),
('v-l1', 'An author who is "Introspective" is likely to be:', ARRAY['Self-examining', 'Aggressive', 'Scientific', 'Humorous'], 0, 'Introspection is the examination of one''s own conscious thoughts and feelings.', 1),
('d-l1', 'In a circular table with 6 people facing inside, A is second to the left of B. If B is at position 1, where is A?', ARRAY['Position 3', 'Position 5', 'Position 2', 'Position 6'], 1, 'In clockwise (facing inside), 2nd left is 2 positions ahead (1+2=3 or 1-2=5 depending on direction). Usually 1 -> 6 -> 5 is left.', 1);

-- 3.3 Mock Tests
INSERT INTO public.mock_tests (id, title, duration_minutes, total_questions)
VALUES 
('cat-mock-alpha', 'CAT 2024 Mock - Alpha (Foundation)', 120, 18),
('cat-mock-beta', 'CAT 2024 Mock - Beta (Intermediate)', 120, 18),
('cat-mock-gamma', 'CAT 2024 Mock - Gamma (Advanced)', 120, 18);

-- 3.4 QUESTIONS FOR MOCK TESTS (18 per test: 6 Quant, 6 VARC, 6 LRDI)

-- MOCK ALPHA: Quant (6)
INSERT INTO public.test_questions (mock_test_id, question_text, options, correct_index, explanation, subject, difficulty, order_index) VALUES
('cat-mock-alpha', 'If a number is increased by 20% and then decreased by 20%, what is the net change?', ARRAY['No change', '4% increase', '4% decrease', '2% decrease'], 2, 'Let the number be 100. 100 * 1.2 = 120. 120 * 0.8 = 96. Net change = 4% decrease.', 'Quant', 'Low', 1),
('cat-mock-alpha', 'Find the average of the first 100 natural numbers.', ARRAY['50', '50.5', '51', '49.5'], 1, 'Formula: (n+1)/2 = 101/2 = 50.5', 'Quant', 'Low', 2),
('cat-mock-alpha', 'A can do a piece of work in 10 days, and B can do it in 15 days. How long will they take working together?', ARRAY['5 days', '6 days', '7 days', '8 days'], 1, '1/10 + 1/15 = 5/30 = 1/6. So 6 days.', 'Quant', 'Low', 3),
('cat-mock-alpha', 'What is the value of log(1000) base 10?', ARRAY['1', '2', '3', '4'], 2, '10^3 = 1000, so the answer is 3.', 'Quant', 'Low', 4),
('cat-mock-alpha', 'Find the roots of x² - 5x + 6 = 0.', ARRAY['1, 6', '2, 3', '-2, -3', '5, 1'], 1, '(x-2)(x-3) = 0, so x = 2 and x = 3.', 'Quant', 'Low', 5),
('cat-mock-alpha', 'A shopkeeper marks his goods 20% above the cost price and allows a 10% discount. Find his profit percentage.', ARRAY['10%', '8%', '12%', '5%'], 1, 'CP=100 -> MP=120 -> SP=120 * 0.9 = 108. Profit = 8%.', 'Quant', 'Low', 6);

-- MOCK ALPHA: VARC (6)
INSERT INTO public.test_questions (mock_test_id, question_text, options, correct_index, explanation, subject, difficulty, order_index) VALUES
('cat-mock-alpha', 'Choose the synonym for "Ephemeral":', ARRAY['Permanent', 'Short-lived', 'Beautiful', 'Lengthy'], 1, 'Ephemeral means lasting for a very short time.', 'VARC', 'Low', 7),
('cat-mock-alpha', 'Which part of the sentence contains an error: "The committee have reached a decision."', ARRAY['The committee', 'have reached', 'a decision', 'No error'], 1, 'Committee is a collective noun, usually takes singular "has".', 'VARC', 'Low', 8),
('cat-mock-alpha', 'Analogies: Library is to Books as Orchard is to:', ARRAY['Apples', 'Trees', 'Fruit', 'Flowers'], 2, 'An orchard is a plantation of fruit trees.', 'VARC', 'Low', 9),
('cat-mock-alpha', 'Identify the passive voice: "The chef cooked a delicious meal."', ARRAY['A delicious meal was cooked by the chef.', 'The chef had cooked a delicious meal.', 'Cooked was a meal delicious by chef.', 'Chef delicious meal cooked.'], 0, 'Standard passive voice construction.', 'VARC', 'Low', 10),
('cat-mock-alpha', 'Fill in: Neither of the two candidates ____ selected.', ARRAY['are', 'were', 'was', 'have been'], 2, '"Neither" takes a singular verb.', 'VARC', 'Low', 11),
('cat-mock-alpha', 'Identify the tone of the sentence: "The government must urgently address the rising inflation to prevent economic collapse."', ARRAY['Sarcastic', 'Urgent/Alarmist', 'Nostalgic', 'Indifferent'], 1, 'The language "urgently" and "economic collapse" signifies urgency.', 'VARC', 'Low', 12);

-- MOCK ALPHA: LRDI (6) -- (Using LRDI as defined in subject constraint)
INSERT INTO public.test_questions (mock_test_id, question_text, options, correct_index, explanation, subject, difficulty, order_index) VALUES
('cat-mock-alpha', 'If A is to the North of B and C is to the East of B, what is the direction of A with respect to C?', ARRAY['North-East', 'South-West', 'North-West', 'South-East'], 2, 'Plotting A and C relative to B shows A is North-West of C.', 'LRDI', 'Low', 13),
('cat-mock-alpha', 'Complete the series: 2, 6, 12, 20, ?', ARRAY['24', '30', '40', '32'], 1, 'Differences are 4, 6, 8, so next is 10. 20+10=30.', 'LRDI', 'Low', 14),
('cat-mock-alpha', 'In a code, APPLE is written as BQQMF. How is BERRY written?', ARRAY['CFSSZ', 'CFSTZ', 'CFSSY', 'DGTTZ'], 0, 'Each letter is shifted by 1.', 'LRDI', 'Low', 15),
('cat-mock-alpha', 'If "Mother" is coded as 1, "Father" as 2, what is "Son"? (Hypothetical logic)', ARRAY['3', '1', '2', '0'], 0, 'Simplistic incremental coding.', 'LRDI', 'Low', 16),
('cat-mock-alpha', 'Pointing to a photograph, a man said, "I have no brother or sister, but that mans father is my fathers son." Whose photograph is it?', ARRAY['His father', 'His son', 'His nephew', 'Himself'], 1, 'My father''s son (with no siblings) = Myself. So "that man''s father is myself". The man is his son.', 'LRDI', 'Low', 17),
('cat-mock-alpha', 'A, B, and C are sitting in a row. B is between A and C. C is not at the right end. What is the order?', ARRAY['ABC', 'CBA', 'BAC', 'BCA'], 1, 'B between A and C means ABC or CBA. Since C is not at the right end, it must be CBA.', 'LRDI', 'Low', 18);

-- REPEAT PATTERN FOR BETA (Intermediate)
INSERT INTO public.test_questions (mock_test_id, question_text, options, correct_index, explanation, subject, difficulty, order_index) VALUES
('cat-mock-beta', 'The ratio of two numbers is 3:4. If their HCF is 4, find their LCM.', ARRAY['12', '48', '16', '24'], 1, 'Numbers are 12 and 16. LCM(12, 16) = 48.', 'Quant', 'Medium', 1),
('cat-mock-beta', 'How many ways can the letters of the word "CAT" be arranged?', ARRAY['3', '6', '9', '1'], 1, '3! = 3 * 2 * 1 = 6.', 'Quant', 'Medium', 2),
('cat-mock-beta', 'If 2^x = 32, find x.', ARRAY['4', '5', '6', '3'], 1, '2^5 = 32.', 'Quant', 'Medium', 3),
('cat-mock-beta', 'The sum of ages of father and son is 50. 5 years ago, father was 7 times as old as son. Find son''s age.', ARRAY['10', '15', '12', '8'], 0, 'x+y=50; (x-5)=7(y-5). Solving gives y=10.', 'Quant', 'Medium', 4),
('cat-mock-beta', 'A circle has area 154 cm². Find its radius.', ARRAY['14', '7', '21', '10.5'], 1, 'pi*r^2 = 154 => 22/7 * r^2 = 154 => r^2 = 49 => r=7.', 'Quant', 'Medium', 5),
('cat-mock-beta', 'Find the 10th term of AP: 2, 5, 8...', ARRAY['27', '29', '31', '25'], 1, 'a + (n-1)d = 2 + 9*3 = 29.', 'Quant', 'Medium', 6),
('cat-mock-beta', 'RC Passage Insight: Which tone best describes a scientific journal?', ARRAY['Subjective', 'Objective', 'Emotional', 'Poetic'], 1, 'Science reporting is typically objective.', 'VARC', 'Medium', 7),
('cat-mock-beta', 'Logical completion: "Although he was tired, ____"', ARRAY['he went to bed.', 'he continued working.', 'he slept well.', 'he felt refreshed.'], 1, '"Although" marks a contrast.', 'VARC', 'Medium', 8),
('cat-mock-beta', 'Contextual meaning: "The witness accounts were corroborate."', ARRAY['Contradictory', 'Supported', 'Ignored', 'Falsified'], 1, 'To corroborate is to support/confirm.', 'VARC', 'Medium', 9),
('cat-mock-beta', 'Identify the metaphor: "Life is a roller coaster."', ARRAY['Life is a roller coaster.', 'He is as brave as a lion.', 'The wind whispered.', 'Boom!'], 0, 'Standard direct comparison without "as/like".', 'VARC', 'Medium', 10),
('cat-mock-beta', 'Grammar: "I have been living here ____ 2010."', ARRAY['for', 'since', 'from', 'at'], 1, '"Since" for a point in time.', 'VARC', 'Medium', 11),
('cat-mock-beta', 'Sentence correction: "Me and him went to the park."', ARRAY['He and I went', 'Him and me went', 'I and he went', 'No change'], 0, 'Subjective pronouns "He and I".', 'VARC', 'Medium', 12),
('cat-mock-beta', 'A is taller than B, B is taller than C. D is shorter than C. Who is the tallest?', ARRAY['A', 'B', 'C', 'D'], 0, 'A > B > C > D.', 'LRDI', 'Medium', 13),
('cat-mock-beta', 'If RED is 27, BLUE is 40 (sum of positions). What is GREEN?', ARRAY['49', '52', '44', '50'], 0, 'G(7)+R(18)+E(5)+E(5)+N(14) = 49.', 'LRDI', 'Medium', 14),
('cat-mock-beta', 'Odd one out: Square, Rectangle, Circle, Triangle', ARRAY['Square', 'Rectangle', 'Circle', 'Triangle'], 2, 'Circle has no straight lines.', 'LRDI', 'Medium', 15),
('cat-mock-beta', 'Calculate: (15 * 6) / (3 + 2)', ARRAY['15', '18', '20', '30'], 1, '90 / 5 = 18.', 'LRDI', 'Medium', 16),
('cat-mock-beta', 'If Saturday falls on Oct 1st, what day is Oct 31st?', ARRAY['Sunday', 'Monday', 'Tuesday', 'Saturday'], 1, '1st, 8th, 15th, 22nd, 29th are Saturdays. 31st is Monday.', 'LRDI', 'Medium', 17),
('cat-mock-beta', 'Blood Relation: A is B''s sister. C is B''s mother. D is C''s father. How is A related to D?', ARRAY['Granddaughter', 'Daughter', 'Niece', 'Sister'], 0, 'A is the daughter of C, so granddaughter of D.', 'LRDI', 'Medium', 18);

-- REPEAT PATTERN FOR GAMMA (Advanced)
INSERT INTO public.test_questions (mock_test_id, question_text, options, correct_index, explanation, subject, difficulty, order_index) VALUES
('cat-mock-gamma', 'Find the last digit of 3^400.', ARRAY['1', '3', '7', '9'], 0, 'Cyclicity is 4 (3, 9, 7, 1). 400 is multiple of 4, so last digit is 1.', 'Quant', 'High', 1),
('cat-mock-gamma', 'What is the sum of infinite terms of GP: 1, 1/2, 1/4...?', ARRAY['1.5', '2', '2.5', 'Infinity'], 1, 'a/(1-r) = 1/(1-0.5) = 2.', 'Quant', 'High', 2),
('cat-mock-gamma', 'Probability of getting a sum of 7 when two dice are rolled.', ARRAY['1/6', '1/12', '5/36', '7/36'], 0, 'Ways: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6/36 = 1/6.', 'Quant', 'High', 3),
('cat-mock-gamma', 'Solve: log(x^2 + 1) = 1 (base 10)', ARRAY['3', '-3', '3 or -3', 'No solution'], 2, 'x^2+1 = 10 -> x^2 = 9 -> x = 3 or -3.', 'Quant', 'High', 4),
('cat-mock-gamma', 'Find the number of trailing zeros in 100!', ARRAY['20', '24', '25', '26'], 1, '100/5 + 100/25 = 20 + 4 = 24.', 'Quant', 'High', 5),
('cat-mock-gamma', 'Angle between hour and minute hand at 3:30?', ARRAY['75°', '90°', '105°', '85°'], 0, '|30h - 5.5m| = |90 - 165| = 75.', 'Quant', 'High', 6),
('cat-mock-gamma', 'RC Paradox: If the speaker is always lying, and says "I am lying", what is the status?', ARRAY['Truth', 'Lie', 'Paradox', 'Nonsense'], 2, 'Liar paradox - logic cycle.', 'VARC', 'High', 7),
('cat-mock-gamma', 'Select the most articulate synonym for "Perspicacious":', ARRAY['Confused', 'Insightful', 'Stubborn', 'Emotional'], 1, 'Eagle-eyed or insightful.', 'VARC', 'High', 8),
('cat-mock-gamma', 'Critical Reasoning: Which premise weakens the argument "A causes B because B follows A"?', ARRAY['A always follows B', 'B can occur without A', 'A and B are correlated', 'A is more frequent than B'], 1, 'Alternative causation or independence weakens temporal cause.', 'VARC', 'High', 9),
('cat-mock-gamma', 'Identify the figure of speech: "The silent screams of the victims."', ARRAY['Simile', 'Hyperbole', 'Oxymoron', 'Personification'], 2, 'Contradictory terms "silent screams".', 'VARC', 'High', 10),
('cat-mock-gamma', 'Structure: Which sentence uses "Whom" correctly?', ARRAY['Whom is going?', 'Whom did you see?', 'Whom can say?', 'To whom is he?'], 1, 'Whom is an object pronoun.', 'VARC', 'High', 11),
('cat-mock-gamma', 'Inference: If the text says "He avoided the spotlight," we can infer he is:', ARRAY['Arrogant', 'Reclusive/Modest', 'Blind', 'Famous'], 1, 'Self-explanatory.', 'VARC', 'High', 12),
('cat-mock-gamma', 'Complex Arrangement: 8 people around a table. A opposite B, C left of B. Where is A relative to C?', ARRAY['Right', 'Left', 'Opposite', 'Diagonal'], 0, 'Plotting circular logic.', 'LRDI', 'High', 13),
('cat-mock-gamma', 'If 5 workers can build 2 walls in 10 days, how many workers to build 4 walls in 5 days?', ARRAY['10', '20', '15', '25'], 1, 'Work = m*d/w. 5*10/2 = x*5/4 => 25 = 1.25x => x = 20.', 'LRDI', 'High', 14),
('cat-mock-gamma', 'A clock loses 5 mins per hour. If set correctly at noon, what time will it show at 6 PM?', ARRAY['5:30 PM', '6:30 PM', '5:35 PM', '6:00 PM'], 0, '6 hours lapse, so 30 mins lost.', 'LRDI', 'High', 15),
('cat-mock-gamma', 'Logic: All Cats are Animals. Some Animals are Dogs. Can we conclude Some Cats are Dogs?', ARRAY['Yes', 'No', 'Maybe', 'Always'], 1, 'Non-overlapping subsets in Venn diagram.', 'LRDI', 'High', 16),
('cat-mock-gamma', 'If the day after tomorrow is Sunday, what was the day before yesterday?', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday'], 2, 'Day after tomorrow is Sunday -> Tomorrow is Saturday -> Today is Friday -> Yesterday was Thursday -> Day before yesterday was Wednesday.', 'LRDI', 'High', 17), -- Wait, Fri -> Thu -> Wed. 
('cat-mock-gamma', 'If Jan 1st 2024 is Monday, what is Jan 1st 2025?', ARRAY['Tuesday', 'Wednesday', 'Thursday', 'Friday'], 1, '2024 is a leap year, so +2 days. Wednesday.', 'LRDI', 'High', 18);

-- ==========================================
-- 4. BUCKET & STORAGE (No RLS needed for objects either, making public)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (Making it entirely open for dev)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Insert Access" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'course-assets');

-- End of Script
