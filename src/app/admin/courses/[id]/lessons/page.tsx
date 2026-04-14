import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { courseService } from '@/services/courseService';
import { Button } from '@/components/ui/Button';
import styles from '@/app/admin/admin.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCurriculumPage({ params }: Props) {
  const { id } = await params;
  const course = await courseService.getCourseById(id);
  
  if (!course) return notFound();

  return (
    <main className={styles.adminContainer}>
      <Navbar />
      
      <div className={styles.header}>
        <div>
          <Link href="/admin" style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>
            ← Back to Dashboard
          </Link>
          <h1>Curriculum: {course.title}</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>Drag and drop coming soon. Currently managed by order index.</p>
        </div>
        <Link href={`/admin/courses/${id}/lessons/new`}>
          <Button variant="primary" size="lg">+ Add New Chapter</Button>
        </Link>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
          {course.curriculum?.map((item, index) => (
            <div key={item.id} style={{ padding: '1.5rem 2rem', borderBottom: index === (course.curriculum?.length || 0) - 1 ? 'none' : '1px solid var(--surface-variant)', display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--surface-variant)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                {index + 1}
              </div>
              
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{item.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
                  <span>{item.readingTime || '10 min'} read</span>
                  <span>•</span>
                  <span>{item.questions?.length || 0} practice questions</span>
                  {item.isLocked && <span style={{ color: 'var(--secondary)' }}>Locked for non-students</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={`/admin/courses/${id}/lessons/${item.id}`}>
                  <Button variant="outline">Edit Content & Questions</Button>
                </Link>
              </div>
            </div>
          ))}

          {(!course.curriculum || course.curriculum.length === 0) && (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--on-surface-variant)' }}>No chapters yet. Let&apos;s start building your curriculum!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
