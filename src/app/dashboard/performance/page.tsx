import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { testService } from '@/services/testService';
import { studentService } from '@/services/studentService';
import { Card } from '@/components/ui/Card';
import styles from '../dashboard.module.css';

async function getAttempts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });
  return data || [];
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
        <span>{label}</span>
        <strong style={{ color }}>{value}{typeof value === 'number' && max === 100 ? '%' : ''} / {max}{max === 100 ? '%' : ''}</strong>
      </div>
      <div style={{ height: '8px', background: '#f0f0f7', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '100px', transition: 'width 0.6s' }} />
      </div>
    </div>
  );
}

export default async function PerformancePage() {
  const [attempts, allTests, analytics] = await Promise.all([
    getAttempts(),
    testService.getMockTests(),
    studentService.getAnalytics(),
  ]);

  const testMap = Object.fromEntries(allTests.map(t => [t.id, t]));

  // Compute aggregated stats from attempts
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + a.score_percentage, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts > 0
    ? Math.max(...attempts.map(a => a.score_percentage))
    : 0;
  const totalCorrect = attempts.reduce((s, a) => s + a.total_correct, 0);
  const totalWrong = attempts.reduce((s, a) => s + a.total_wrong, 0);
  const totalAttempted = totalCorrect + totalWrong;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Score trend (last 6)
  const trend = attempts.slice(0, 6).reverse();

  // Subject breakdown from analytics table (fallback computed from attempts)
  const subjectStats: Record<string, { correct: number; wrong: number; unattempted: number }> = {};
  // (We don't store per-subject in attempts easily without questions breakdown,
  //  so show overall analytics from the analytics table)

  return (
    <>
      <header className={styles.header}>
        <h1>Performance Analytics</h1>
        <p>Deep dive into your precision metrics and competitive standing.</p>
      </header>

      {/* Key Stats */}
      <div className={styles.statsGrid} style={{ marginBottom: '3rem' }}>
        {[
          { label: 'Mocks Taken', value: totalAttempts || analytics.totalMocksTaken, color: '#1565c0', bg: '#e3f2fd' },
          { label: 'Avg. Score', value: `${avgScore || analytics.averageScorePercentage}%`, color: '#2e7d32', bg: '#e8f5e9' },
          { label: 'Best Score', value: `${bestScore}%`, color: '#6a1b9a', bg: '#f3e5f5' },
          { label: 'Accuracy', value: `${overallAccuracy || analytics.accuracyRate}%`, color: '#e65100', bg: '#fff3e0' },
        ].map(s => (
          <Card key={s.label} className={styles.statCard} style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </Card>
        ))}
      </div>

      {totalAttempts === 0 ? (
        <Card style={{ textAlign: 'center', padding: '4rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>No Data Yet</h3>
          <p style={{ color: 'var(--on-surface-variant)' }}>
            Complete at least one mock test to see your performance analytics.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Score Trend */}
          <Card style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Score Trend (Last 6)</h3>
            {trend.length === 0 ? (
              <p style={{ color: 'var(--on-surface-variant)' }}>No attempts yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {trend.map((a, i) => {
                  const color = a.score_percentage >= 70 ? '#2e7d32' : a.score_percentage >= 50 ? '#e65100' : '#c62828';
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', minWidth: '16px' }}>
                        {i + 1}
                      </span>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>
                            {testMap[a.mock_test_id]?.title || a.mock_test_id}
                          </span>
                          <strong style={{ color }}>{a.score_percentage}%</strong>
                        </div>
                        <div style={{ height: '6px', background: '#f0f0f7', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${a.score_percentage}%`, background: color, borderRadius: '100px' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Accuracy Breakdown */}
          <Card style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Overall Breakdown</h3>
            <StatBar label="Correct Answers" value={totalCorrect} max={totalCorrect + totalWrong + attempts.reduce((s, a) => s + a.total_unattempted, 0)} color="#2e7d32" />
            <StatBar label="Wrong Answers" value={totalWrong} max={totalCorrect + totalWrong + attempts.reduce((s, a) => s + a.total_unattempted, 0)} color="#c62828" />
            <StatBar label="Unattempted" value={attempts.reduce((s, a) => s + a.total_unattempted, 0)} max={totalCorrect + totalWrong + attempts.reduce((s, a) => s + a.total_unattempted, 0)} color="#9e9e9e" />
            <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <StatBar label="Accuracy Rate" value={overallAccuracy} max={100} color="#1565c0" />
            </div>
          </Card>

          {/* All Attempts Table */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Card style={{ padding: '2rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>All Attempts</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--outline-variant)' }}>
                      {['Test', 'Score', 'Correct', 'Wrong', 'Skipped', 'Accuracy', 'Time', 'Date'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--on-surface-variant)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map(a => {
                      const acc = (a.total_correct + a.total_wrong) > 0
                        ? Math.round((a.total_correct / (a.total_correct + a.total_wrong)) * 100) : 0;
                      const color = a.score_percentage >= 70 ? '#2e7d32' : a.score_percentage >= 50 ? '#e65100' : '#c62828';
                      const m = Math.floor(a.time_taken_seconds / 60), s = a.time_taken_seconds % 60;
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--surface-variant)' }}>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                            {testMap[a.mock_test_id]?.title || a.mock_test_id}
                          </td>
                          <td style={{ padding: '0.875rem 1rem' }}>
                            <span style={{ fontWeight: 700, color }}>{a.score_percentage}%</span>
                          </td>
                          <td style={{ padding: '0.875rem 1rem', color: '#2e7d32', fontWeight: 600 }}>{a.total_correct}</td>
                          <td style={{ padding: '0.875rem 1rem', color: '#c62828', fontWeight: 600 }}>{a.total_wrong}</td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--on-surface-variant)' }}>{a.total_unattempted}</td>
                          <td style={{ padding: '0.875rem 1rem' }}>{acc}%</td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--on-surface-variant)' }}>{m}m {s}s</td>
                          <td style={{ padding: '0.875rem 1rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>
                            {new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
