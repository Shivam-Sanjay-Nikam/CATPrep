import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Section } from '@/components/layout/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { testService } from '@/services/testService';
import Link from 'next/link';

export default async function MockTestsLibraryPage() {
  const tests = await testService.getMockTests();

  return (
    <main>
      <Navbar />
      
      <Section background="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Adaptive Mock Series</h1>
        <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          Simulate the real CAT experience with our high-fidelity mock interface and precision analytics.
        </p>
      </Section>

      <Section background="surface">
        {tests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Tests Available Yet</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>We are currently updating our mock test library. Please check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {tests.map(test => (
              <Card key={test.id} className="test-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    padding: '0.5rem 1rem', 
                    background: 'var(--primary-container)', 
                    color: 'white', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    FULL MOCK
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                     {test.durationMinutes} MINS
                  </div>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{test.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
                  Features 66 questions Across Quant, VARC, and DILR with an interface mirroring the actual CAT software.
                </p>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    {test.totalQuestions} Questions • Adaptive
                  </span>
                  <Link href={`/mock-tests/${test.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary">Take Test</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
