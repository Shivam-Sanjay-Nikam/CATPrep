import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { courseService } from '@/services/courseService';
import Image from 'next/image';
import Link from 'next/link';

export default async function CoursesPage() {
  const courses = await courseService.getCourses();

  return (
    <main>
      <Navbar />
      
      <Section background="container" className="courses-header">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Academic Library</h1>
        <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          Explore our curated collection of CAT specialized modules, designed by the industry&apos;s most successful alumni.
        </p>
      </Section>

      <Section background="surface">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          {courses.map(course => (
            <Card key={course.id} className="course-card">
              <div style={{ position: 'relative', height: '220px', margin: '-1.5rem -1.5rem 1.5rem -1.5rem' }}>
                <Image 
                  src={course.thumbnail} 
                  alt={course.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                  {course.tags.map(tag => (
                    <span key={tag} style={{ 
                      padding: '0.25rem 0.75rem', 
                      background: 'rgba(255,255,255,0.9)', 
                      backdropFilter: 'blur(4px)',
                      color: 'var(--primary)', 
                      fontSize: '0.625rem', 
                      fontWeight: 700,
                      borderRadius: '100px',
                      textTransform: 'uppercase'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{course.title}</h3>
              <div 
                style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--on-surface-variant)', 
                  marginBottom: '1.5rem', 
                  lineHeight: '1.6',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  height: '4.8em'
                }}
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
              
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(118, 118, 131, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface)' }}>{course.instructor}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{course.duration} • {course.lessons} Lessons</div>
                </div>
                <Link href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" style={{ padding: '0.5rem 1rem' }}>View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
