import { Course, CurriculumItem } from "@/types";
import { createClient } from "@/utils/supabase/server";

interface DbQuestion {
  id: string;
  lesson_id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  order_index: number;
}

interface DbLesson {
  id: string;
  title: string;
  duration: string;
  reading_time: string | null;
  is_locked: boolean;
  content: string;
  order_index: number;
  lesson_questions?: DbQuestion[];
}

interface DbCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[] | null;
  lessons_count: number | null;
  price: number | null;
  thumbnail: string;
  lessons?: DbLesson[];
}

const mapLesson = (l: DbLesson): CurriculumItem => ({
  id: l.id,
  title: l.title,
  duration: l.duration,
  readingTime: l.reading_time || '5 min',
  isLocked: l.is_locked,
  content: l.content,
  orderIndex: l.order_index,
  questions: (l.lesson_questions || []).map((q: DbQuestion) => ({
    id: q.id,
    lessonId: q.lesson_id,
    questionText: q.question_text,
    options: q.options,
    correctIndex: q.correct_index,
    explanation: q.explanation,
    orderIndex: q.order_index
  }))
});

const mapCourse = (c: DbCourse): Course => ({
  id: c.id,
  title: c.title,
  description: c.description,
  instructor: c.instructor,
  duration: c.duration,
  difficulty: c.difficulty,
  tags: c.tags || [],
  lessons: c.lessons_count || 0,
  price: c.price || 0,
  thumbnail: c.thumbnail,
  curriculum: (c.lessons || []).map(mapLesson)
});

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(*, lesson_questions(*))')
      .order('order_index', { referencedTable: 'lessons', ascending: true })
      .order('order_index', { referencedTable: 'lessons.lesson_questions', ascending: true });
    
    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
    
    return (data || []).map(mapCourse);
  },

  async getCourseById(id: string): Promise<Course | undefined> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*, lessons(*, lesson_questions(*))')
      .eq('id', id)
      .order('order_index', { referencedTable: 'lessons', ascending: true })
      .order('order_index', { referencedTable: 'lessons.lesson_questions', ascending: true })
      .single();
    
    if (error) {
      console.error('Error fetching course:', error);
      return undefined;
    }
    
    return mapCourse(data);
  }
};
