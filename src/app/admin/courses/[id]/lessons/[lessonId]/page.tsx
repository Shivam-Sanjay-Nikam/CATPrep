import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { courseService } from '@/services/courseService';
import { LessonEditor } from './LessonEditor';

interface Props {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function AdminEditLessonPage({ params }: Props) {
  const { id, lessonId } = await params;
  const isNew = lessonId === 'new';
  
  // Fetch course first to ensure it exists
  const course = await courseService.getCourseById(id);
  if (!course) return notFound();

  let lesson = null;
  if (!isNew) {
    lesson = course.curriculum?.find(l => l.id === lessonId);
    if (!lesson) return notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />
      <div style={{ padding: '0 1.5rem' }}>
        <LessonEditor courseId={id} initialLesson={lesson} isNew={isNew} />
      </div>
    </main>
  );
}
