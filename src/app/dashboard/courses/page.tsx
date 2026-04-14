import React from 'react';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { studentService } from '@/services/studentService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from '../dashboard.module.css';

export default async function MyCoursesPage() {
  const [allCourses, progress] = await Promise.all([
    courseService.getCourses(),
    studentService.getProgress(),
  ]);

  const enrolled = progress.map(p => ({
    ...p,
    course: allCourses.find(c => c.id === p.courseId),
  })).filter(p => p.course);

  const progressById = Object.fromEntries(progress.map(p => [p.courseId, p]));

  const notEnrolled = allCourses.filter(c => !progressById[c.id]);

  return (
    <>
      <header className={styles.header}>
        <h1>My Courses</h1>
        <p>Track your learning journey across all enrolled modules.</p>
      </header>

      {/* Enrolled */}
      {enrolled.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 className={styles.sectionTitle}>In Progress</h2>
          <div className={styles.courseGrid}>
            {enrolled.map(item => {
              const pct = item.totalLessons > 0
                ? Math.round((item.completedLessons / item.totalLessons) * 100)
                : 0;
              return (
                <Card key={item.courseId} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'inline-block', padding: '0.25rem 0.75rem',
                    background: 'var(--primary-container)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem', fontWeight: 700, color: 'white',
                    alignSelf: 'flex-start'
                  }}>
                    {item.course!.difficulty.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {item.course!.title}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                      {item.course!.instructor}
                    </span>
                  </div>

                  <div className={styles.courseProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    <div className={styles.progressLabel}>
                      <span>{item.completedLessons} / {item.totalLessons} Lessons</span>
                      <span style={{ fontWeight: 700 }}>{pct}%</span>
                    </div>
                  </div>

                  <Link href={`/courses/${item.courseId}/learn`} style={{ marginTop: 'auto' }}>
                    <Button variant="primary" fullWidth>
                      {pct === 0 ? 'Start Learning' : pct === 100 ? 'Review Course' : 'Continue →'}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Available courses */}
      <section>
        <h2 className={styles.sectionTitle}>
          {enrolled.length === 0 ? 'Available Courses' : 'Explore More'}
        </h2>
        {notEnrolled.length === 0 && enrolled.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
              No courses available yet. Check back soon!
            </p>
          </Card>
        )}
        {notEnrolled.length === 0 && enrolled.length > 0 && (
          <Card style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--on-surface-variant)' }}>
              You are enrolled in all available courses!
            </p>
          </Card>
        )}
        <div className={styles.courseGrid}>
          {notEnrolled.map(course => (
            <Card key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.85 }}>
              <div style={{
                display: 'inline-block', padding: '0.25rem 0.75rem',
                background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem', fontWeight: 700, color: 'var(--on-surface-variant)',
                alignSelf: 'flex-start'
              }}>{course.difficulty.toUpperCase()}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{course.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{course.instructor}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', flexGrow: 1 }}>
                {course.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                </span>
                <Link href={`/courses/${course.id}`}>
                  <Button variant="outline">View Course</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
