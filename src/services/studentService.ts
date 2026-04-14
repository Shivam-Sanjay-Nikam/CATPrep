import { Analytics, StudentProgress } from "@/types";
import { createClient } from "@/utils/supabase/server";

export const studentService = {
  async getAnalytics(): Promise<Analytics> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { totalMocksTaken: 0, averageScorePercentage: 0, timePerCorrectQuestion: 0, accuracyRate: 0 };

    // Compute live analytics from test_attempts
    const { data: attempts } = await supabase
      .from('test_attempts')
      .select('score_percentage, total_correct, total_wrong, time_taken_seconds')
      .eq('user_id', user.id);

    if (!attempts || attempts.length === 0) {
      return { totalMocksTaken: 0, averageScorePercentage: 0, timePerCorrectQuestion: 0, accuracyRate: 0 };
    }

    const totalMocksTaken = attempts.length;
    const avgScore = Math.round(attempts.reduce((s, a) => s + a.score_percentage, 0) / totalMocksTaken);
    const totalCorrect = attempts.reduce((s, a) => s + a.total_correct, 0);
    const totalWrong = attempts.reduce((s, a) => s + a.total_wrong, 0);
    const accuracyRate = (totalCorrect + totalWrong) > 0
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
      : 0;
    const totalTimeSecs = attempts.reduce((s, a) => s + a.time_taken_seconds, 0);
    const timePerCorrectQuestion = totalCorrect > 0 ? Math.round(totalTimeSecs / totalCorrect) : 0;

    return { totalMocksTaken, averageScorePercentage: avgScore, timePerCorrectQuestion, accuracyRate };
  },

  async getProgress(): Promise<StudentProgress[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error || !data) return [];

    // Map DB snake_case → TS camelCase
    return data.map((row) => ({
      courseId: row.course_id,
      completedLessons: row.completed_lessons,
      totalLessons: row.total_lessons,
      lastAccessed: row.last_accessed,
    }));
  },

  async getProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      name: user.user_metadata?.full_name || 'Aspirant',
      email: user.email,
      targetIIM: user.user_metadata?.target_iim || 'IIM Ahmedabad',
      percentileGoal: user.user_metadata?.percentile_goal || '99.0',
    };
  },

  async getRecentAttempts(limit = 3) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('test_attempts')
      .select('mock_test_id, score_percentage, total_correct, total_wrong, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(limit);

    return data || [];
  },
};
