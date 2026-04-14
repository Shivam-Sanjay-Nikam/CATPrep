import { createClient } from "@/utils/supabase/server";

export const enrollmentService = {
  async checkEnrollment(courseId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('student_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }

    return !!data;
  },

  async enroll(courseId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    // Get basic course info for total lessons
    const { data: course } = await supabase
      .from('courses')
      .select('lessons_count')
      .eq('id', courseId)
      .single();

    const { error } = await supabase
      .from('student_progress')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        completed_lessons: 0,
        total_lessons: course?.lessons_count || 0,
        last_accessed: new Date().toISOString()
      }, { onConflict: 'user_id,course_id' });

    if (error) {
      console.error('Error enrolling:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
};
