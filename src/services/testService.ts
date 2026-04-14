import { MockTest, Question } from "@/types";
import { createClient } from "@/utils/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTest(row: any): MockTest {
  return {
    id: row.id,
    title: row.title,
    durationMinutes: row.duration_minutes,
    totalQuestions: row.total_questions,
    questions: (row.test_questions || []).map((q: any): Question => ({
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
