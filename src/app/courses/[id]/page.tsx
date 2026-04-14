import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { EnrollmentButton } from '@/components/courses/EnrollmentButton';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import Image from 'next/image';
import styles from './course-details.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailsPage({ params }: Props) {
  const { id } = await params;
  const course = await courseService.getCourseById(id);

  if (!course) {
    return notFound();
  }

  const isEnrolled = await enrollmentService.checkEnrollment(id);

  return (
    <main>
      <Navbar />
      
      {/* Hero Header */}
      <section className={styles.detailsHero}>
        <div className={styles.heroContent}>
          <div>
            <div className={styles.badgeStack}>
              {course.tags.map(tag => (
                <span key={tag} className={styles.badge}>{tag}</span>
              ))}
              <span className={styles.badge}>{course.difficulty}</span>
            </div>
            <h1 className={styles.title}>{course.title}</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant)', marginBottom: '2.5rem', maxWidth: '600px' }}>
              {course.description}
            </p>
            <div className={styles.meta}>
              <span>By {course.instructor}</span>
              <span>•</span>
              <span>{course.duration} TOTAL</span>
              <span>•</span>
              <span>{course.lessons} CHAPTERS</span>
            </div>
          </div>
          <div style={{ position: 'relative', height: '300px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0, 6, 102, 0.1)' }}>
            <Image 
              src={course.thumbnail} 
              alt={course.title} 
              fill 
              priority
              loading="eager"
              sizes="(max-width: 768px) 100vw, 400px"
              style={{ objectFit: 'cover' }} 
            />
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className={styles.mainContent}>
        <section>
          <h2 className={styles.sectionTitle}>Course Curriculum</h2>
          <div className={styles.curriculumList}>
            {course.curriculum?.map((item, index) => (
              <div key={item.id} className={styles.curriculumItem}>
                <div className={styles.lessonNum}>{index + 1}</div>
                <div className={styles.lessonTitle}>{item.title}</div>
                <div className={styles.lessonDuration}>{item.duration}</div>
                {item.isLocked && !isEnrolled ? (
                  <span className={styles.lockedIcon}>Lock</span>
                ) : (
                  <span style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 700 }}>
                    {isEnrolled ? 'READ' : 'PREVIEW'}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '4rem' }}>
            <h2 className={styles.sectionTitle}>About the Instructor</h2>
            <Card variant="default" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                {course.instructor.split(',')[0].charAt(course.instructor.indexOf(' ') + 1)}
              </div>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{course.instructor}</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                  Industry veteran and pedagogy expert with over 12 years of experience in CAT coaching. 
                  Specializes in first-principles thinking and time-optimization strategies.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Sticky Enrollment Sidebar */}
        <aside>
          <Card className={styles.sidebarCard} variant="elevated">
            <div className={styles.price}>{course.price === 0 ? 'FREE' : `₹${course.price.toLocaleString()}`}</div>
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>No video distractions</li>
              <li className={styles.benefitItem}>Deep-dive textual notes</li>
              <li className={styles.benefitItem}>Chapter-wise focus questions</li>
              <li className={styles.benefitItem}>IIM alumni support network</li>
            </ul>
            <EnrollmentButton 
              courseId={course.id} 
              isEnrolled={isEnrolled} 
              price={course.price} 
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: '1rem' }}>
              30-day focus guarantee. No questions asked.
            </p>
          </Card>
        </aside>
      </div>
    </main>
  );
}
