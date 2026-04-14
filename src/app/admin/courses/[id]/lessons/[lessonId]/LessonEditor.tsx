'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertLesson, upsertQuestion } from '@/services/adminService';
import { CurriculumItem, LessonQuestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from '../../editor.module.css';

interface LessonEditorProps {
  courseId: string;
  initialLesson?: CurriculumItem | null;
  isNew?: boolean;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({ courseId, initialLesson, isNew }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [lesson, setLesson] = useState<Partial<CurriculumItem>>(initialLesson || {
    id: '',
    title: '',
    readingTime: '10 min',
    isLocked: false,
    content: '',
    orderIndex: 0
  });

  const [questions, setQuestions] = useState<Partial<LessonQuestion>[]>(initialLesson?.questions || []);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: crypto.randomUUID(),
      questionText: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      orderIndex: questions.length
    }]);
  };

  const handleQuestionChange = (index: number, field: keyof LessonQuestion, value: string | number | string[]) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[qIndex].options || [])];
    options[oIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson.id || !lesson.title) {
      alert('ID and Title are required');
      return;
    }

    setLoading(true);
    try {
      // 1. Save Lesson
      await upsertLesson({ 
        ...lesson, 
        course_id: courseId 
      } as Partial<CurriculumItem> & { course_id: string });

      // 2. Save Questions
      for (const q of questions) {
        await upsertQuestion({ 
          ...q, 
          lesson_id: lesson.id! 
        } as Partial<LessonQuestion> & { lesson_id: string });
      }

      alert('Chapter and questions saved successfully!');
      router.push(`/admin/courses/${courseId}/lessons`);
      router.refresh();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save content. Check permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.editorContainer} onSubmit={handleSubmit} style={{ maxWidth: '1000px' }}>
      <h2 style={{ marginBottom: '2.5rem' }}>{isNew ? 'New Chapter' : 'Edit Chapter Content'}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className={styles.formGroup}>
          <label>Chapter ID (Slug)</label>
          <input 
            className={styles.input}
            placeholder="e.g., number-systems-1"
            value={lesson.id}
            onChange={e => setLesson(prev => ({ ...prev, id: e.target.value }))}
            disabled={!isNew}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Reading Time</label>
          <input 
            className={styles.input}
            placeholder="e.g., 15 min"
            value={lesson.readingTime}
            onChange={e => setLesson(prev => ({ ...prev, readingTime: e.target.value }))}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Chapter Title</label>
        <input 
          className={styles.input}
          placeholder="Enter a descriptive title"
          value={lesson.title}
          onChange={e => setLesson(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Lesson Content (HTML/Rich Text)</label>
        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
          Supports basic HTML for formatting. Use &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, etc.
        </p>
        <textarea 
          className={styles.textarea}
          style={{ minHeight: '400px', fontFamily: 'monospace' }}
          placeholder="Write your in-depth textual notes here..."
          value={lesson.content || ''}
          onChange={e => setLesson(prev => ({ ...prev, content: e.target.value }))}
        />
      </div>

      <hr style={{ margin: '4rem 0', border: 'none', borderTop: '1px solid var(--surface-variant)' }} />

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Practice Questions</h3>
        <Button variant="outline" type="button" onClick={handleAddQuestion}>+ Add Question</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {questions.map((q, qIndex) => (
          <Card key={q.id || qIndex} variant="default" style={{ padding: '2rem', border: '1px solid var(--outline-variant)' }}>
            <div className={styles.formGroup}>
              <label>Question {qIndex + 1}</label>
              <textarea 
                className={styles.input}
                style={{ minHeight: '80px' }}
                value={q.questionText}
                onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              {q.options?.map((opt, oIndex) => (
                <div key={oIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="radio" 
                    name={`correct-${qIndex}`} 
                    checked={q.correctIndex === oIndex}
                    onChange={() => handleQuestionChange(qIndex, 'correctIndex', oIndex)}
                  />
                  <input 
                    className={styles.input}
                    style={{ flexGrow: 1, padding: '0.5rem' }}
                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                    value={opt}
                    onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
              <label>Explanation (Shown after answering)</label>
              <textarea 
                className={styles.textarea}
                style={{ minHeight: '60px' }}
                value={q.explanation}
                onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
              />
            </div>
            
            <Button 
              variant="text" 
              type="button" 
              style={{ color: 'var(--error)', marginTop: '1rem' }}
              onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
            >
              Remove Question
            </Button>
          </Card>
        ))}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" type="submit" disabled={loading} style={{ flexGrow: 1 }}>
          {loading ? 'Saving Comprehensive Content...' : 'Save Chapter & Questions'}
        </Button>
        <Button variant="outline" type="button" onClick={() => router.push(`/admin/courses/${courseId}/lessons`)}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
