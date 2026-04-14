'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MockTest, Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { saveTestAttempt } from '@/services/adminService';
import styles from './mock-test.module.css';

interface Props {
  test: MockTest;
}

// CAT scoring: +3 correct, -1 wrong, 0 unattempted
const MARKS_CORRECT = 3;
const MARKS_WRONG = -1;

type SubjectStats = {
  correct: number;
  wrong: number;
  unattempted: number;
  total: number;
  score: number;
};

function computeResults(questions: Question[], answers: Record<string, number>, timeTaken: number) {
  let correct = 0, wrong = 0, unattempted = 0;
  const subjectMap: Record<string, SubjectStats> = {};

  for (const q of questions) {
    const sub = q.subject;
    if (!subjectMap[sub]) subjectMap[sub] = { correct: 0, wrong: 0, unattempted: 0, total: 0, score: 0 };
    subjectMap[sub].total++;

    const selected = answers[q.id];
    if (selected === undefined || selected === -1) {
      unattempted++;
      subjectMap[sub].unattempted++;
    } else if (selected === q.correctOptionIndex) {
      correct++;
      subjectMap[sub].correct++;
      subjectMap[sub].score += MARKS_CORRECT;
    } else {
      wrong++;
      subjectMap[sub].wrong++;
      subjectMap[sub].score += MARKS_WRONG;
    }
  }

  const rawScore = correct * MARKS_CORRECT + wrong * MARKS_WRONG;
  const maxScore = questions.length * MARKS_CORRECT;
  const scorePercentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

  return { correct, wrong, unattempted, rawScore, maxScore, scorePercentage, subjectMap, timeTaken };
}

export default function MockTestClient({ test }: Props) {
  const { toast, removeToast } = useToast();
  const [phase, setPhase] = useState<'test' | 'results'>('test');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [results, setResults] = useState<ReturnType<typeof computeResults> | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (phase !== 'test') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentQuestion = test.questions[currentQ];

  const handleSubmit = useCallback(async () => {
    const taken = test.durationMinutes * 60 - timeLeft;
    const res = computeResults(test.questions, answers, taken);
    setResults(res);
    setPhase('results');

    // Persist attempt
    setSaving(true);
    const toastId = toast('Saving your test attempt...', 'loading', Infinity);
    try {
      await saveTestAttempt({
        mock_test_id: test.id,
        answers,
        score: res.rawScore,
        total_correct: res.correct,
        total_wrong: res.wrong,
        total_unattempted: res.unattempted,
        score_percentage: res.scorePercentage,
        time_taken_seconds: taken,
      });
      removeToast(toastId);
      toast('Test attempt saved successfully!', 'success');
    } catch (e) {
      console.warn('Could not save attempt:', e);
      removeToast(toastId);
      toast('Could not save your attempt. Please check your connection.', 'error');
    } finally {
      setSaving(false);
    }
  }, [answers, test, timeLeft, toast, removeToast]);

  // ─── RESULTS SCREEN ───────────────────────────────────────────────
  if (phase === 'results' && results) {
    const accuracy = results.correct + results.wrong > 0
      ? Math.round((results.correct / (results.correct + results.wrong)) * 100)
      : 0;

    const verdictColor = results.scorePercentage >= 70 ? '#2e7d32'
      : results.scorePercentage >= 50 ? '#e65100' : '#c62828';
    const verdict = results.scorePercentage >= 70 ? 'Excellent Performance'
      : results.scorePercentage >= 50 ? 'Good Effort' : 'Needs Improvement';

    const subjects = Object.keys(results.subjectMap);

    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: '100px',
              background: '#f0f4ff', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700,
              marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              Test Completed
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{test.title}</h1>
            <p style={{ color: 'var(--on-surface-variant)' }}>
              Completed in {formatTime(results.timeTaken)} {saving && '· Saving...'}
            </p>
          </div>

          {/* Score Card */}
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--outline-variant)', padding: '2.5rem',
            marginBottom: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '5rem', fontWeight: 900, color: verdictColor, lineHeight: 1 }}>
              {results.rawScore}
            </div>
            <div style={{ color: 'var(--on-surface-variant)', margin: '0.5rem 0 1rem', fontSize: '0.9rem' }}>
              out of {results.maxScore} marks
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: verdictColor }}>{results.scorePercentage}%</div>
            <div style={{
              display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1.5rem',
              borderRadius: '100px', background: verdictColor + '18',
              color: verdictColor, fontWeight: 700, fontSize: '1rem'
            }}>
              {verdict}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Correct', value: results.correct, color: '#2e7d32', bg: '#e8f5e9' },
              { label: 'Wrong', value: results.wrong, color: '#c62828', bg: '#ffebee' },
              { label: 'Unattempted', value: results.unattempted, color: '#5c5c7a', bg: '#f0f0f7' },
              { label: 'Accuracy', value: `${accuracy}%`, color: '#1565c0', bg: '#e3f2fd' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: stat.bg, borderRadius: 'var(--radius-md)', padding: '1.5rem',
                textAlign: 'center', border: `1px solid ${stat.color}22`
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Section-wise Analysis */}
          {subjects.length > 0 && (
            <div style={{
              background: 'white', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--outline-variant)', padding: '2rem', marginBottom: '2rem'
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Section-wise Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {subjects.map(sub => {
                  const s = results.subjectMap[sub];
                  const pct = s.total > 0 ? Math.round(((s.correct * MARKS_CORRECT + s.wrong * MARKS_WRONG) / (s.total * MARKS_CORRECT)) * 100) : 0;
                  const barColor = pct >= 70 ? '#2e7d32' : pct >= 50 ? '#e65100' : '#c62828';
                  return (
                    <div key={sub}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                        <span style={{ fontWeight: 700 }}>{sub}</span>
                        <span style={{ color: 'var(--on-surface-variant)' }}>
                          C: {s.correct} · W: {s.wrong} · U: {s.unattempted} &nbsp;|&nbsp;<strong style={{ color: barColor }}>{s.score} marks</strong>
                        </span>
                      </div>
                      <div style={{ height: '10px', background: '#f0f0f7', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${Math.max(0, pct)}%`,
                          background: barColor, borderRadius: '100px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => { setShowReview(true); setReviewIdx(0); }}>
              Review All Answers
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/mock-tests'}>
              Back to Tests
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>

          {/* Answer Review Panel */}
          {showReview && test.questions.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Answer Review</h3>

              {/* Mini navigation */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem'
              }}>
                {test.questions.map((q, i) => {
                  const sel = answers[q.id];
                  const isCorrect = sel === q.correctOptionIndex;
                  const isWrong = sel !== undefined && sel !== -1 && !isCorrect;
                  const bg = isCorrect ? '#2e7d32' : isWrong ? '#c62828' : '#9e9e9e';
                  return (
                    <button key={i} onClick={() => setReviewIdx(i)} style={{
                      width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                      background: reviewIdx === i ? 'var(--primary)' : bg,
                      color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                    }}>{i + 1}</button>
                  );
                })}
              </div>

              {(() => {
                const q = test.questions[reviewIdx];
                const sel = answers[q.id];
                const isAttempted = sel !== undefined && sel !== -1;
                const isCorrect = sel === q.correctOptionIndex;
                return (
                  <div style={{
                    background: 'white', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--outline-variant)', padding: '2rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.875rem' }}>
                        QUESTION {reviewIdx + 1}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                        background: isCorrect ? '#e8f5e9' : !isAttempted ? '#f5f5f5' : '#ffebee',
                        color: isCorrect ? '#2e7d32' : !isAttempted ? '#757575' : '#c62828'
                      }}>
                        {isCorrect ? `+${MARKS_CORRECT} Correct` : !isAttempted ? '0 Skipped' : `${MARKS_WRONG} Wrong`}
                      </span>
                    </div>

                    <div 
                      style={{ fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '2rem' }}
                      className="rich-text-content"
                      dangerouslySetInnerHTML={{ __html: q.text }} 
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {q.options.map((opt, oi) => {
                        const isSelected = sel === oi;
                        const isRight = oi === q.correctOptionIndex;
                        const bg = isRight ? '#e8f5e9' : isSelected ? '#ffebee' : 'var(--surface)';
                        const border = isRight ? '2px solid #2e7d32' : isSelected ? '2px solid #c62828' : '1px solid var(--outline-variant)';
                        return (
                          <div key={oi} style={{
                            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                            background: bg, border, display: 'flex', gap: '1rem', alignItems: 'center'
                          }}>
                            <span style={{ fontWeight: 700, minWidth: '20px' }}>{String.fromCharCode(65 + oi)}</span>
                            <span>{opt}</span>
                            {isRight && <span style={{ marginLeft: 'auto', color: '#2e7d32', fontWeight: 700, fontSize: '0.8rem' }}>Correct</span>}
                            {isSelected && !isRight && <span style={{ marginLeft: 'auto', color: '#c62828', fontWeight: 700, fontSize: '0.8rem' }}>Your answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={{
                        background: '#f0f4ff', borderRadius: 'var(--radius-md)',
                        padding: '1rem 1.25rem', borderLeft: '4px solid var(--primary)'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                          Explanation
                        </div>
                        <div 
                          style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--on-surface)' }}
                          className="rich-text-content"
                          dangerouslySetInnerHTML={{ __html: q.explanation }} 
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <Button variant="outline" disabled={reviewIdx === 0} onClick={() => setReviewIdx(p => p - 1)}>← Prev</Button>
                      <Button variant="primary" disabled={reviewIdx === test.questions.length - 1} onClick={() => setReviewIdx(p => p + 1)}>Next →</Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── TEST SCREEN ───────────────────────────────────────────────────
  if (!currentQuestion) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>This test has no questions yet.</h2>
          <p style={{ color: 'var(--on-surface-variant)', margin: '1rem 0' }}>
            Ask your admin to add questions to this mock test.
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/mock-tests'}>Back to Tests</Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(v => v !== -1).length;

  return (
    <div className={styles.container}>
      {/* Question Area */}
      <main className={styles.content}>
        <div className={styles.questionSheet}>
          <header className={styles.questionHeader}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--secondary)' }}>
                QUESTION {currentQ + 1} / {test.questions.length}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                {currentQuestion.subject} · {currentQuestion.difficulty}
              </span>
            </div>
            <Button variant="text" onClick={() => setFlagged(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}>
              {flagged[currentQuestion.id] ? 'Unflag' : 'Flag for Review'}
            </Button>
          </header>

          <div 
            className={`${styles.questionBody} rich-text-content`}
            dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
          />

          <div className={styles.optionsList}>
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className={`${styles.option} ${answers[currentQuestion.id] === idx ? styles.selectedOption : ''}`}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: idx }))}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', border: '1px solid currentColor',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                }}>
                  {String.fromCharCode(65 + idx)}
                </div>
                {option}
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Button variant="secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}>
              Previous
            </Button>
            <div>
              <Button variant="text" style={{ marginRight: '1rem' }}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: -1 }))}>
                Clear Response
              </Button>
              {currentQ < test.questions.length - 1 ? (
                <Button variant="primary" onClick={() => setCurrentQ(p => p + 1)}>Next & Save</Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit}>Submit Test</Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} glass-panel`}>
        <div className={styles.timerContainer}>
          <div className={styles.timer} style={{ color: timeLeft < 300 ? '#c62828' : 'var(--primary)' }}>
            {formatTime(timeLeft)}
          </div>
          <div className={styles.timerLabel}>Time Remaining</div>
        </div>

        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Question Palette</div>
        <div className={styles.navGrid}>
          {test.questions.map((q, idx) => {
            let className = styles.navCircle;
            if (currentQ === idx) className += ` ${styles.navActive}`;
            else if (flagged[q.id]) className += ` ${styles.navFlagged}`;
            else if (answers[q.id] !== undefined && answers[q.id] !== -1) className += ` ${styles.navAnswered}`;
            return (
              <button key={q.id} className={className} onClick={() => setCurrentQ(idx)}>
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span>Answered: {answeredCount}</span>
            <span>Flagged: {Object.values(flagged).filter(Boolean).length}</span>
          </div>
          <Button variant="primary" fullWidth onClick={handleSubmit}>
            Submit Test
          </Button>
          <Button variant="secondary" fullWidth onClick={() => window.location.href = '/mock-tests'}>
            Exit Test
          </Button>
        </div>
      </aside>
    </div>
  );
}
