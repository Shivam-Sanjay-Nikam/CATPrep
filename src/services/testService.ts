import { MockTest, Question } from "@/types";
import { createClient } from "@/utils/supabase/server";

interface RawTestRow {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  test_questions?: Array<{
    id: string;
    question_text: string;
    options: string[];
    correct_index: number;
    explanation?: string;
    subject?: 'Quant' | 'LRDI' | 'VARC';
    difficulty?: 'Low' | 'Medium' | 'High';
  }>;
}

function mapTest(row: RawTestRow): MockTest {
  return {
    id: row.id,
    title: row.title,
    durationMinutes: row.duration_minutes,
    totalQuestions: row.total_questions,
    questions: (row.test_questions || []).map((q): Question => ({
      id: q.id,
      text: q.question_text,
      options: q.options,
      correctOptionIndex: q.correct_index,
      explanation: q.explanation || '',
      subject: q.subject || 'Quant',
      difficulty: q.difficulty || 'Medium',
    }))
  };
}

export const testService = {
  async getMockTests(): Promise<MockTest[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*, test_questions(*)');

    if (error) return [];
    return (data || []).map(mapTest);
  },

  async getTestById(id: string): Promise<MockTest | undefined> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*, test_questions(*)')
      .eq('id', id)
      .single();

    if (error) return undefined;
    return mapTest(data);
  }
};
