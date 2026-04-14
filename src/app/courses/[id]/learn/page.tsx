import React, { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { courseService } from '@/services/courseService';
import { studentService } from '@/services/studentService';
import { enrollmentService } from '@/services/enrollmentService';
import { PracticeZone } from './PracticeZone';
import { ScrollReset } from './ScrollReset';
import { Button } from '@/components/ui/Button';
import styles from './learn.module.css';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function LearnPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { lesson: lessonId } = await searchParams;
  
  // 1. Check enrollment
  const isEnrolled = await enrollmentService.checkEnrollment(id);
  if (!isEnrolled) {
    redirect(`/courses/${id}`);
  }

  // 2. Fetch course & curriculum
  const course = await courseService.getCourseById(id);
  if (!course) return notFound();

  // 3. Find current lesson and adjacent ones
  const curriculum = course.curriculum || [];
  const currentIndex = lessonId 
    ? curriculum.findIndex(l => l.id === lessonId)
    : 0;
  
  const currentLesson = curriculum[currentIndex];
  const prevLesson = currentIndex > 0 ? curriculum[currentIndex - 1] : null;
  const nextLesson = currentIndex < curriculum.length - 1 ? curriculum[currentIndex + 1] : null;

  // 4. Update progress
  if (currentLesson) {
    await studentService.updateLessonProgress(id, currentLesson.id, curriculum.length);
  }

  return (
    <main>
      <Suspense fallback={null}>
        <ScrollReset />
      </Suspense>
      <Navbar />
      <div className={styles.learnContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 style={{ fontWeight: 800 }}>{course.title}</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
              {course.lessons} Chapters • {course.duration}
            </div>
          </div>
          <div className={styles.curriculumList}>
            {curriculum.map((item, index) => (
              <Link 
                key={item.id} 
                href={`?lesson=${item.id}`}
                className={`${styles.lessonItem} ${currentLesson?.id === item.id ? styles.activeLesson : ''}`}
              >
                <div style={{ opacity: 0.5, fontSize: '0.875rem', fontWeight: 700 }}>{String(index + 1).padStart(2, '0')}</div>
                <div style={{ flexGrow: 1, fontWeight: 500 }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{item.readingTime || '10m'}</div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Reading Area */}
        <section className={styles.mainContent}>
          {currentLesson ? (
            <div className={styles.lessonDetails}>
              <div className={styles.readingMeta}>
                <span>CHAPTER {currentIndex + 1}</span>
                <span>•</span>
                <span>{currentLesson.readingTime || '10 MIN'} READ</span>
                <span>•</span>
                <span>{currentLesson.questions?.length || 0} QUESTIONS</span>
              </div>

              <h1>{currentLesson.title}</h1>
              
              <div className={styles.contentBody}>
                {currentLesson.content ? (
                  <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                ) : (
                  <>
                    <p>
                      Welcome to this deep dive into <strong>{currentLesson.title}</strong>. 
                      In the competitive landscape of the CAT exam, mastering this topic requires 
                      a blend of theoretical clarity and strategic application.
                    </p>
                    <p>
                      This chapter is designed to provide you with the first-principles understanding 
                      necessary to tackle even the most complex variants of these problems. We will 
                      focus on shortcuts that save time without compromising accuracy.
                    </p>
                    <div style={{ margin: '3rem 0', padding: '2rem', background: 'var(--primary-container)', borderRadius: 'var(--radius-md)', color: 'var(--on-primary-container)' }}>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--on-primary-container)' }}>
                        Pro-Tip for CAT
                      </h4>
                      <p style={{ margin: 0, fontSize: '1rem', color: 'var(--on-primary-container)' }}>
                        Always look for the underlying pattern rather than jumping straight into calculations. 
                        In VARC and Quant alike, the conceptual structure is your strongest ally.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Practice Section */}
              <PracticeZone questions={currentLesson.questions || []} />

              <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--outline-variant)', paddingTop: '2rem' }}>
                {prevLesson ? (
                  <Link href={`?lesson=${prevLesson.id}`}>
                    <Button variant="text">← Previous Chapter</Button>
                  </Link>
                ) : <div />}
                
                {nextLesson ? (
                  <Link href={`?lesson=${nextLesson.id}`}>
                    <Button variant="primary">Next Chapter →</Button>
                  </Link>
                ) : <div />}
              </div>
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              Select a chapter to begin your journey.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
