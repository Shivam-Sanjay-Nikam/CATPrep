import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { courseService } from '@/services/courseService';
import { CourseEditor } from './CourseEditor';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCoursePage({ params }: Props) {
  const { id } = await params;
  const isNew = id === 'new';
  
  let course = null;
  if (!isNew) {
    course = await courseService.getCourseById(id);
    if (!course) return notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />
      <div style={{ padding: '0 1.5rem' }}>
        <CourseEditor initialCourse={course} isNew={isNew} />
      </div>
    </main>
  );
}
