import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { courseService } from '@/services/courseService';
import Image from 'next/image';

export default async function LandingPage() {
  const courses = await courseService.getCourses();

  return (
    <main>
      <Navbar />
      
      {/* Hero Section */}
      <Section background="surface" className="hero">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.03em' }}>
              Escape the Noise.<br/>
              Master the <span style={{ color: 'var(--secondary)' }}>CAT</span>.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--on-surface-variant)', marginBottom: '2.5rem', maxWidth: '500px' }}>
              Enter a focused digital environment designed for high-stakes preparation. Elite resources for the serious CAT aspirant.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="primary">Explore Modules</Button>
              <Button variant="secondary">View Mock Series</Button>
            </div>
          </div>
          <div style={{ position: 'relative', height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0, 6, 102, 0.08)' }}>
            <Image 
              src="/images/algebra_thumb.png" 
              alt="Elite Academic Environment" 
              fill 
              priority
              loading="eager"
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover', opacity: 0.9 }}
            />
          </div>
        </div>
      </Section>

      {/* Featured Courses */}
      <Section background="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Specialized Modules</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>Curated content focused on fundamental mastery and advanced application.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {courses.map(course => (
            <Card key={course.id} className="course-card">
              <div style={{ position: 'relative', height: '180px', margin: '-1.5rem -1.5rem 1.5rem -1.5rem' }}>
                <Image 
                  src={course.thumbnail} 
                  alt={course.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }} 
                />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{course.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{course.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>{course.instructor}</span>
                <Link href={`/courses/${course.id}`}>
                  <Button variant="text" style={{ padding: 0 }}>Enroll →</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Philosophy Section */}
      <Section background="lowest">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>The Academic Sanctuary</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
              We&apos;ve replaced the cluttered, gamified EdTech aesthetic with a premium, quiet library feel. 
              The UI recedes to allow your focus to take center stage.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }} />
                <span>Adaptive Testing Environment</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }} />
                <span>Precision Analytics Engines</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }} />
                <span>Elite Batch Pedagogy</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Focus is the Ultimate Competitive Edge.</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--on-surface-variant)' }}>
              Join 15,000+ aspirants who have traded chaos for precision preparation.
            </p>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section background="primary" className="footer">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '3rem', color: 'rgba(255,255,255,0.8)' }}>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>ACADEMIC SANCTUARY</h4>
            <p style={{ fontSize: '0.875rem' }}>Precision in Preparation. We provide elite digital environments for competitive excellence.</p>
          </div>
          <div>
            <h5 style={{ color: 'white', marginBottom: '1.25rem' }}>Explore</h5>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>Courses</li>
              <li>Mock Series</li>
              <li>Free Materials</li>
            </ul>
          </div>
          <div>
            <h5 style={{ color: 'white', marginBottom: '1.25rem' }}>Support</h5>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>Help Center</li>
              <li>FAQ</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h5 style={{ color: 'white', marginBottom: '1.25rem' }}>Subscribe</h5>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Get prep insights delivered to your inbox.</p>
            <input 
              type="text" 
              placeholder="Email address" 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', width: '100%', marginBottom: '0.5rem' }} 
            />
            <Button fullWidth style={{ background: 'var(--secondary)' }}>Join Newsletter</Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
