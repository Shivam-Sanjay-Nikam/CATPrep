'use server';

import { createClient } from '@/utils/supabase/server';
import { Course, CurriculumItem, LessonQuestion } from '@/types';

/**
 * Create or update a course (Server Action)
 */
export async function upsertCourse(course: Partial<Course>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('courses')
    .upsert({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      difficulty: course.difficulty,
      tags: course.tags,
      price: course.price,
      thumbnail: course.thumbnail,
      lessons_count: course.lessons || 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create or update a lesson (Server Action)
 */
export async function upsertLesson(lesson: Partial<CurriculumItem> & { course_id: string }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lessons')
    .upsert({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      duration: lesson.duration,
      reading_time: lesson.readingTime,
      is_locked: lesson.isLocked,
      content: lesson.content,
      order_index: lesson.orderIndex ?? 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add or update a practice question (Server Action)
 */
export async function upsertQuestion(question: Partial<LessonQuestion> & { lesson_id: string }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lesson_questions')
    .upsert({
      id: question.id,
      lesson_id: question.lesson_id,
      question_text: question.questionText,
      options: question.options,
      correct_index: question.correctIndex,
      explanation: question.explanation,
      order_index: question.orderIndex ?? 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Upload an asset (thumbnail, PDF, etc.) - Handled via FormData for Server Action compatibility
 */
export async function uploadAsset(formData: FormData) {
  const file = formData.get('file') as File;
  const path = formData.get('path') as string;
  
  if (!file) throw new Error('No file provided');

  const supabase = await createClient();

  const { data, error } = await supabase
    .storage
    .from('course-assets')
    .upload(path, file, {
      upsert: true,
      contentType: file.type
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase
    .storage
    .from('course-assets')
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete a course (Server Action)
 */
export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Create or update a mock test (Server Action)
 */
export async function upsertMockTest(test: Partial<import('@/types').MockTest>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('mock_tests')
    .upsert({
      id: test.id,
      title: test.title,
      duration_minutes: test.durationMinutes || 120,
      total_questions: test.totalQuestions || 66
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a mock test (Server Action)
 */
export async function deleteMockTest(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('mock_tests')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Create or update a test question (Server Action)
 */
export async function upsertTestQuestion(question: {
  id?: string;
  mock_test_id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  subject?: string;
  difficulty?: string;
  order_index?: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('test_questions')
    .upsert(question)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a test question (Server Action)
 */
export async function deleteTestQuestion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('test_questions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Save a completed test attempt with calculated score (Server Action)
 */
export async function saveTestAttempt(payload: {
  mock_test_id: string;
  answers: Record<string, number>;
  score: number;
  total_correct: number;
  total_wrong: number;
  total_unattempted: number;
  score_percentage: number;
  time_taken_seconds: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('test_attempts')
    .insert({ ...payload, user_id: user.id });

  if (error) throw error;
}
