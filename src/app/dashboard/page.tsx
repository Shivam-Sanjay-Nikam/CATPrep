import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { studentService } from '@/services/studentService';
import { courseService } from '@/services/courseService';
import { testService } from '@/services/testService';
import styles from './dashboard.module.css';

export default async function DashboardPage() {
  const profile = await studentService.getProfile();

  if (!profile) redirect('/login');

  const [analytics, progress, allCourses, allTests, recentAttempts] = await Promise.all([
    studentService.getAnalytics(),
    studentService.getProgress(),
    courseService.getCourses(),
    testService.getMockTests(),
    studentService.getRecentAttempts(3),
  ]);

  const activeCourses = progress
    .map(p => ({ ...p, course: allCourses.find(c => c.id === p.courseId) }))
    .filter(p => p.course && p.totalLessons > 0);

  const testMap = Object.fromEntries(allTests.map(t => [t.id, t]));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Welcome Header */}
      <header className={styles.header}>
        <div>
          <h1>{greeting()}, {profile.name.split(' ')[0]}</h1>
          <p>
            Targeting <strong style={{ color: 'var(--primary)' }}>{profile.percentileGoal} percentile</strong> at {profile.targetIIM}.
            {analytics.totalMocksTaken > 0
              ? ` You've taken ${analytics.totalMocksTaken} mock${analytics.totalMocksTaken > 1 ? 's' : ''} with an average score of ${analytics.averageScorePercentage}%.`
              : ' Start your first mock test today!'}
          </p>
        </div>
        <Link href="/mock-tests">
          <Button variant="primary" size="lg">Take Practice Test</Button>
        </Link>
      </header>

      {/* Stats Row */}
      <div className={styles.statsGrid}>
        {[
          {
            label: 'Mocks Taken',
            value: analytics.totalMocksTaken || '—',
            sub: analytics.totalMocksTaken > 0 ? 'tests completed' : 'none yet',
            color: '#1565c0',
            bg: '#e3f2fd',
          },
          {
            label: 'Avg. Score',
            value: analytics.totalMocksTaken > 0 ? `${analytics.averageScorePercentage}%` : '—',
            sub: analytics.totalMocksTaken > 0 ? 'across all mocks' : 'no data yet',
            color: '#2e7d32',
            bg: '#e8f5e9',
          },
          {
            label: 'Accuracy Rate',
            value: analytics.totalMocksTaken > 0 ? `${analytics.accuracyRate}%` : '—',
            sub: analytics.totalMocksTaken > 0 ? 'correct out of attempted' : 'no data yet',
            color: '#6a1b9a',
            bg: '#f3e5f5',
          },
          {
            label: 'Time/Question',
            value: analytics.totalMocksTaken > 0 ? `${analytics.timePerCorrectQuestion}s` : '—',
            sub: analytics.totalMocksTaken > 0 ? 'per correct answer' : 'no data yet',
            color: '#e65100',
            bg: '#fff3e0',
          },
        ].map(stat => (
          <Card key={stat.label} className={styles.statCard} style={{ background: stat.bg, border: `1px solid ${stat.color}22` }}>
            <div className={styles.statValue} style={{ color: stat.color, fontSize: '1.75rem' }}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div style={{ fontSize: '0.7rem', color: stat.color + 'aa', marginTop: '0.25rem' }}>{stat.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
        <div>
          {/* Active Learning */}
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Active Courses</h2>
              <Link href="/dashboard/courses" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            {activeCourses.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: '2.5rem' }}>
                <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
                  You haven&apos;t started any courses yet.
                </p>
                <Link href="/courses">
                  <Button variant="primary">Browse Courses</Button>
                </Link>
              </Card>
            ) : (
              <div className={styles.courseGrid}>
                {activeCourses.slice(0, 4).map(item => {
                  const pct = item.totalLessons > 0
                    ? Math.round((item.completedLessons / item.totalLessons) * 100) : 0;
                  return (
                    <Card key={item.courseId} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          padding: '0.3rem 0.75rem', borderRadius: '100px',
                          fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.02em',
                          background: 'var(--primary-container)', color: 'var(--on-primary-container)'
                        }}>{item.course!.difficulty.toUpperCase()}</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: pct === 100 ? '#2e7d32' : 'var(--primary)' }}>
                            {pct}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                          {item.course!.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }} />
                          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                            {item.course!.instructor?.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: '0.5rem' }}>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${pct}%`, background: pct === 100 ? '#2e7d32' : undefined }} />
                        </div>
                        <div className={styles.progressLabel}>
                          <span>{item.completedLessons} of {item.totalLessons} modules</span>
                          {pct === 100 && <span style={{ color: '#2e7d32' }}>Completed</span>}
                        </div>
                      </div>

                      <Link href={`/courses/${item.courseId}/learn`} style={{ marginTop: 'auto' }}>
                        <Button variant={pct === 100 ? 'outline' : 'primary'} fullWidth style={{ fontWeight: 700 }}>
                          {pct === 0 ? 'Start Course' : pct === 100 ? 'Review Content' : 'Continue Learning'}
                        </Button>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Browse Courses', href: '/courses', desc: 'Explore the full library' },
                { label: 'Take a Mock Test', href: '/mock-tests', desc: 'CAT-style adaptive tests' },
                { label: 'View Analytics', href: '/dashboard/performance', desc: 'Detailed performance data' },
              ].map(action => (
                <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                  <Card style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s', height: '100%' }}
                    className="hover-lift">
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{action.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{action.desc}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Recent Attempts */}
          <Card style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700 }}>Recent Mocks</h3>
              <Link href="/dashboard/mocks" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                All →
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  No tests taken yet.
                </p>
                <Link href="/mock-tests">
                  <Button variant="primary" fullWidth>Start First Mock</Button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentAttempts.map((a, i) => {
                  const color = a.score_percentage >= 70 ? '#2e7d32'
                    : a.score_percentage >= 50 ? '#e65100' : '#c62828';
                  return (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                        background: color + '18', border: `2px solid ${color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, color, fontSize: '0.8rem'
                      }}>
                        {a.score_percentage}%
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {testMap[a.mock_test_id]?.title || 'Mock Test'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                          Correct: {a.total_correct} · Wrong: {a.total_wrong}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>
                        {new Date(a.completed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  );
                })}
                <Link href="/dashboard/mocks" style={{ marginTop: '0.5rem' }}>
                  <Button variant="outline" fullWidth>View All History</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Goal Tracker */}
          <Card style={{ padding: '1.75rem', background: 'var(--primary-container)', borderColor: 'transparent' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>Your Goal</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {profile.percentileGoal} Percentile · {profile.targetIIM}
            </p>
            {analytics.totalMocksTaken > 0 ? (
              <>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '100px', height: '8px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '100px', background: 'white',
                    width: `${Math.min(100, analytics.averageScorePercentage)}%`, transition: 'width 0.6s'
                  }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                  Current avg: <strong style={{ color: 'white' }}>{analytics.averageScorePercentage}%</strong>
                  {analytics.averageScorePercentage >= 80
                    ? ' · On track!'
                    : analytics.averageScorePercentage >= 60
                    ? ' · Keep pushing!'
                    : ' · More practice needed'}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                Complete your first mock to track progress toward your goal.
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
