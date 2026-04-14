'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

interface EnrollmentButtonProps {
  courseId: string;
  isEnrolled: boolean;
  price: number;
}

export const EnrollmentButton: React.FC<EnrollmentButtonProps> = ({ courseId, isEnrolled, price }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleEnrollment = async () => {
    setIsLoading(true);
    
    if (price > 0) {
      // Direct to simulated payment route
      router.push(`/checkout/${courseId}`);
      return;
    }

    // Free enrollment
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Get lessons count
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
      console.error('Enrollment error:', error);
      alert('Failed to enroll. Please try again.');
      setIsLoading(false);
    } else {
      router.push(`/courses/${courseId}/learn`);
      router.refresh();
    }
  };

  if (isEnrolled) {
    return (
      <Button 
        variant="primary" 
        fullWidth 
        onClick={() => router.push(`/courses/${courseId}/learn`)}
      >
        Enter Course
      </Button>
    );
  }

  return (
    <Button 
      variant="primary" 
      fullWidth 
      onClick={handleEnrollment}
      isLoading={isLoading}
    >
      {price === 0 ? 'Enroll for Free' : `Join Module (₹${price.toLocaleString()})`}
    </Button>
  );
};
