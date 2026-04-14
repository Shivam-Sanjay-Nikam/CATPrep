import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { courseService } from '@/services/courseService';
import { testService } from '@/services/testService';
import { Button } from '@/components/ui/Button';
import styles from './admin.module.css';

export default async function AdminDashboard() {
  const courses = await courseService.getCourses();
  const mockTests = await testService.getMockTests();

  return (
    <main className={styles.adminContainer}>
      <Navbar />
      
      <div className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>Manage your CAT Prep courses and content</p>
        </div>
        <Link href="/admin/courses/new">
          <Button variant="primary" size="lg">+ Create New Course</Button>
        </Link>
      </div>

      <div className={styles.courseGrid}>
        {courses.map((course) => (
          <div key={course.id} className={styles.adminCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.badge}>{course.difficulty}</span>
                <h3 className={styles.courseTitle}>{course.title}</h3>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                {course.price === 0 ? 'FREE' : `₹${course.price.toLocaleString()}`}
              </div>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineClamp: '2', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
              {course.description}
            </p>

            <div className={styles.courseMeta}>
              <span>{course.lessons} Chapters</span>
              <span>•</span>
              <span>{course.instructor?.split(',')[0] || 'TBA'}</span>
            </div>

            <div className={styles.cardActions}>
              <Link href={`/admin/courses/${course.id}`} style={{ flexGrow: 1 }}>
                <Button variant="outline" style={{ width: '100%' }}>Edit Course</Button>
              </Link>
              <Link href={`/admin/courses/${course.id}/lessons`}>
                <Button variant="text">Manage Content</Button>
              </Link>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)' }}>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>No courses found. Start by creating your first course!</p>
            <Link href="/admin/courses/new">
              <Button variant="primary">Create Course</Button>
            </Link>
          </div>
        )}
      </div>

      <div className={styles.header} style={{ marginTop: '4rem' }}>
        <div>
          <h2>Mock Tests</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>Manage adaptive mock series</p>
        </div>
        <Link href="/admin/mock-tests/new">
          <Button variant="primary" size="lg">+ Create New Test</Button>
        </Link>
      </div>

      <div className={styles.courseGrid}>
        {mockTests.map((test) => (
          <div key={test.id} className={styles.adminCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.badge}>MOCK</span>
                <h3 className={styles.courseTitle}>{test.title}</h3>
              </div>
            </div>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
              Features {test.totalQuestions} questions across syllabus. Duration: {test.durationMinutes} mins.
            </p>

            <div className={styles.cardActions}>
              <Link href={`/admin/mock-tests/${test.id}`} style={{ flexGrow: 1 }}>
                <Button variant="outline" style={{ width: '100%' }}>Edit Test</Button>
              </Link>
            </div>
          </div>
        ))}

        {mockTests.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline)' }}>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>No mock tests found.</p>
            <Link href="/admin/mock-tests/new">
              <Button variant="primary">Create Mock Test</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
