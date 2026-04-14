'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { upsertMockTest, upsertTestQuestion, deleteTestQuestion } from '@/services/adminService';
import { MockTest, Question } from '@/types';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import styles from '../../courses/[id]/editor.module.css';

interface MockTestEditorProps {
  initialTest?: MockTest | null;
  isNew?: boolean;
}

type DraftQuestion = {
  id?: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  subject: string;
  difficulty: string;
  order_index: number;
};

function blankQuestion(order: number): DraftQuestion {
  return {
    question_text: '',
    options: ['', '', '', ''],
    correct_index: 0,
    explanation: '',
    subject: 'Quant',
    difficulty: 'Medium',
    order_index: order,
  };
}

export const MockTestEditor: React.FC<MockTestEditorProps> = ({ initialTest, isNew }) => {
  const router = useRouter();
  const { toast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savingQ, setSavingQ] = useState<number | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState(!isNew);

  const [test, setTest] = useState<Partial<MockTest>>(initialTest || {
    id: '',
    title: '',
    durationMinutes: 120,
    totalQuestions: 66,
  });

  const toDraft = (q: Question, i: number): DraftQuestion => ({
    id: q.id,
    question_text: q.text,
    options: q.options,
    correct_index: q.correctOptionIndex,
    explanation: q.explanation,
    subject: q.subject,
    difficulty: q.difficulty,
    order_index: i,
  });

  const [questions, setQuestions] = useState<DraftQuestion[]>(
    initialTest?.questions?.map(toDraft) || []
  );

  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // ---- Test metadata save ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test.id || !test.title) {
      toast('ID and Title are required', 'error');
      return;
    }
    setLoading(true);
    const toastId = toast('Saving mock test metadata...', 'loading', Infinity);
    try {
      await upsertMockTest(test);
      setIsSavedToDb(true);
      removeToast(toastId);
      toast('Mock test metadata saved!', 'success');
    } catch (err) {
      console.error(err);
      removeToast(toastId);
      toast('Failed to save metadata. Is the schema applied?', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---- Question helpers ----
  const addQuestion = () => {
    const newQ = blankQuestion(questions.length + 1);
    setQuestions(prev => [...prev, newQ]);
    setExpandedQ(questions.length);
  };

  const updateQ = (idx: number, patch: Partial<DraftQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...patch } : q));
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[optIdx] = value;
      return { ...q, options };
    }));
  };

  const saveQuestion = async (idx: number) => {
    if (!isSavedToDb) {
      toast('Please save the mock test metadata first.', 'info');
      return;
    }
    const q = questions[idx];
    if (!q.question_text.trim() || q.options.some(o => !o.trim())) {
      toast('Please fill in the question and all 4 options.', 'error');
      return;
    }
    setSavingQ(idx);
    const toastId = toast(`Saving question ${idx + 1}...`, 'loading', Infinity);
    try {
      const saved = await upsertTestQuestion({ ...q, mock_test_id: test.id as string });
      updateQ(idx, { id: saved.id });
      removeToast(toastId);
      toast(`Question ${idx + 1} saved successfully!`, 'success');
    } catch (err) {
      console.error(err);
      removeToast(toastId);
      toast(`Failed to save question ${idx + 1}.`, 'error');
    } finally {
      setSavingQ(null);
    }
  };

  const removeQuestion = async (idx: number) => {
    const q = questions[idx];
    if (q.id) {
      const toastId = toast('Deleting question...', 'loading', Infinity);
      try {
        await deleteTestQuestion(q.id);
        removeToast(toastId);
        toast('Question deleted from database.', 'success');
      } catch (err) {
        console.error(err);
        removeToast(toastId);
        toast('Failed to delete question.', 'error');
        return;
      }
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    if (expandedQ === idx) setExpandedQ(null);
  };

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 1.5rem' }}>

      {/* ---- Mock Test Metadata Form ---- */}
      <form className={styles.editorContainer} onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '2.5rem' }}>
          {isNew ? 'Create New Mock Test' : 'Edit Mock Test'}
        </h2>

        <div className={styles.formGroup}>
          <label>Test ID (Slug)</label>
          <input
            className={styles.input}
            placeholder="e.g., cat-2024-mock-1"
            value={test.id}
            onChange={e => setTest(prev => ({ ...prev, id: e.target.value }))}
            disabled={!isNew}
            required
          />
          {isNew && <small style={{ color: 'var(--on-surface-variant)' }}>Used in the URL. Cannot be changed after saving.</small>}
        </div>

        <div className={styles.formGroup}>
          <label>Title</label>
          <input
            className={styles.input}
            placeholder="e.g., CAT 2024 Full Mock"
            value={test.title}
            onChange={e => setTest(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className={styles.formGroup}>
            <label>Duration (Minutes)</label>
            <input
              type="number"
              className={styles.input}
              value={test.durationMinutes}
              onChange={e => setTest(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Total Questions</label>
            <input
              type="number"
              className={styles.input}
              value={test.totalQuestions}
              onChange={e => setTest(prev => ({ ...prev, totalQuestions: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" type="submit" disabled={loading} style={{ flexGrow: 1 }}>
            {loading ? 'Saving...' : isSavedToDb && !isNew ? 'Update Mock Test' : 'Save Mock Test Metadata'}
          </Button>
          {isSavedToDb && (
            <Button variant="outline" type="button" onClick={() => { router.push('/admin'); router.refresh(); }}>
              ← Back to Admin
            </Button>
          )}
          {!isSavedToDb && (
            <Button variant="outline" type="button" onClick={() => router.push('/admin')}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* ---- Questions Section ---- */}
      {isSavedToDb && (
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Questions ({questions.length})</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                Add, edit, or remove questions for this test.
              </p>
            </div>
            <Button variant="primary" type="button" onClick={addQuestion}>+ Add Question</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q, qIdx) => (
              <div key={qIdx} style={{
                background: 'white',
                border: '1px solid var(--outline-variant)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {/* Question header */}
                <div
                  onClick={() => setExpandedQ(expandedQ === qIdx ? null : qIdx)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.5rem', cursor: 'pointer',
                    background: expandedQ === qIdx ? 'var(--surface-container-low)' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: q.id ? 'var(--primary)' : 'var(--outline-variant)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                    }}>{qIdx + 1}</span>
                    <span style={{ fontWeight: 600, color: q.question_text ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                      {q.question_text ? (stripHtml(q.question_text).substring(0, 60) + (stripHtml(q.question_text).length > 60 ? '...' : '')) : 'New Question — click to expand'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem', fontWeight: 700,
                      background: q.subject === 'Quant' ? '#e8f5e9' : q.subject === 'VARC' ? '#e3f2fd' : '#fce4ec',
                      color: q.subject === 'Quant' ? '#2e7d32' : q.subject === 'VARC' ? '#1565c0' : '#880e4f',
                    }}>{q.subject}</span>
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem' }}>
                      {expandedQ === qIdx ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Question body */}
                {expandedQ === qIdx && (
                  <div style={{ padding: '1.5rem', borderTop: '1px solid var(--outline-variant)' }}>

                    <div className={styles.formGroup}>
                      <label>Question Text (Rich Text)</label>
                      <RichTextEditor 
                        value={q.question_text || ''}
                        onChange={html => updateQ(qIdx, { question_text: html })}
                        placeholder="Enter the full question text..."
                        minHeight="150px"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Options (mark the correct one)</label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correct_index === optIdx}
                            onChange={() => updateQ(qIdx, { correct_index: optIdx })}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                          <input
                            className={styles.input}
                            style={{ margin: 0, flexGrow: 1 }}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                          />
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, minWidth: '60px', textAlign: 'center',
                            color: q.correct_index === optIdx ? 'var(--primary)' : 'var(--on-surface-variant)'
                          }}>
                            {q.correct_index === optIdx ? 'CORRECT' : ''}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Explanation (Rich Text)</label>
                      <RichTextEditor 
                        value={q.explanation || ''}
                        onChange={html => updateQ(qIdx, { explanation: html })}
                        placeholder="Explain why the correct answer is correct..."
                        minHeight="100px"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className={styles.formGroup}>
                        <label>Subject</label>
                        <select
                          className={styles.select}
                          value={q.subject}
                          onChange={e => updateQ(qIdx, { subject: e.target.value })}
                        >
                          <option>Quant</option>
                          <option>VARC</option>
                          <option>LRDI</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Difficulty</label>
                        <select
                          className={styles.select}
                          value={q.difficulty}
                          onChange={e => updateQ(qIdx, { difficulty: e.target.value })}
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <Button
                        variant="primary"
                        type="button"
                        disabled={savingQ === qIdx}
                        onClick={() => saveQuestion(qIdx)}
                        style={{ flexGrow: 1 }}
                      >
                        {savingQ === qIdx ? 'Saving...' : q.id ? 'Update Question' : 'Save Question'}
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        style={{ color: '#c62828', borderColor: '#c62828' }}
                      >
                        Delete
                      </Button>
                    </div>

                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '3rem', border: '2px dashed var(--outline-variant)',
                borderRadius: 'var(--radius-lg)', color: 'var(--on-surface-variant)'
              }}>
                No questions yet. Click <strong>+ Add Question</strong> to get started.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
