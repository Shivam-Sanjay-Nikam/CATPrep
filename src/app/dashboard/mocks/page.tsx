import React from 'react';
import Link from 'next/link';
import { testService } from '@/services/testService';
import { createClient } from '@/utils/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from '../dashboard.module.css';

async function getMyAttempts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  if (error) return [];
  return data || [];
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${m}m ${s}s`;
}

export default async function MockSeriesPage() {
  const [allTests, myAttempts] = await Promise.all([
    testService.getMockTests(),
    getMyAttempts(),
  ]);

  const attemptsByTest: Record<string, typeof myAttempts> = {};
  for (const a of myAttempts) {
    if (!attemptsByTest[a.mock_test_id]) attemptsByTest[a.mock_test_id] = [];
    attemptsByTest[a.mock_test_id].push(a);
  }

  return (
    <>
      <header className={styles.header}>
        <h1>Mock Series</h1>
        <p>Your full-length adaptive CAT mock tests and attempt history.</p>
      </header>

      {/* Recent attempts summary */}
      {myAttempts.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 className={styles.sectionTitle}>Recent Attempts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myAttempts.slice(0, 5).map(attempt => {
              const test = allTests.find(t => t.id === attempt.mock_test_id);
              const scoreColor = attempt.score_percentage >= 70 ? '#2e7d32'
                : attempt.score_percentage >= 50 ? '#e65100' : '#c62828';
              return (
                <Card key={attempt.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.5rem' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                    background: scoreColor + '18', border: `2px solid ${scoreColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: scoreColor, fontSize: '0.9rem'
                  }}>
                    {attempt.score_percentage}%
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                      {test?.title || attempt.mock_test_id}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                      C: {attempt.total_correct} · W: {attempt.total_wrong} · U: {attempt.total_unattempted} &nbsp;·&nbsp;
                      Score: <strong>{attempt.score}</strong> &nbsp;·&nbsp;
                      Time: {formatDuration(attempt.time_taken_seconds)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>
                    {new Date(attempt.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* All Tests */}
      <section>
        <h2 className={styles.sectionTitle}>Available Tests</h2>
        {allTests.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>No mock tests available yet.</p>
            <Link href="/mock-tests"><Button variant="primary">Browse Library</Button></Link>
          </Card>
        ) : (
          <div className={styles.courseGrid}>
            {allTests.map(test => {
              const attempts = attemptsByTest[test.id] || [];
              const best = attempts.reduce((b, a) => (!b || a.score_percentage > b.score_percentage ? a : b), null as typeof myAttempts[0] | null);
              const bestColor = best
                ? (best.score_percentage >= 70 ? '#2e7d32' : best.score_percentage >= 50 ? '#e65100' : '#c62828')
                : 'var(--on-surface-variant)';

              return (
                <Card key={test.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem', fontWeight: 700,
                      background: 'var(--primary-container)', color: 'white'
                    }}>FULL MOCK</span>
                    {best && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: bestColor }}>
                        Best: {best.score_percentage}%
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{test.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                    {test.totalQuestions} questions · {test.durationMinutes} minutes
                  </p>

                  {attempts.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                      Attempted {attempts.length}×
                    </div>
                  )}

                  <Link href={`/mock-tests/${test.id}`} style={{ marginTop: 'auto' }}>
                    <Button variant="primary" fullWidth>
                      {attempts.length === 0 ? 'Start Test' : 'Retake Test'}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
