'use client';

import React, { useState } from 'react';
import { LessonQuestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './learn.module.css';

interface PracticeZoneProps {
  questions: LessonQuestion[];
}

export const PracticeZone: React.FC<PracticeZoneProps> = ({ questions }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const handleOptionSelect = (questionId: string, optionIndex: number) => {
    if (showFeedback[questionId]) return;
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const checkAnswer = (questionId: string) => {
    if (selectedOptions[questionId] === undefined) return;
    setShowFeedback(prev => ({ ...prev, [questionId]: true }));
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className={styles.practiceZone}>
      <h2 className={styles.practiceTitle}>Practice Zone</h2>
      <p className={styles.practiceSubtitle}>Master the concepts with these focus questions.</p>

      {questions.map((q, index) => {
        const isCorrect = selectedOptions[q.id] === q.correctIndex;
        const feedbackVisible = showFeedback[q.id];

        return (
          <Card key={q.id} className={styles.questionCard} variant="default">
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>Question {index + 1}</span>
              <div 
                className={`${styles.questionText} rich-text-content`}
                dangerouslySetInnerHTML={{ __html: q.questionText }}
              />
            </div>

            <div className={styles.optionsGrid}>
              {q.options.map((option, optIndex) => {
                let optionStyle = styles.optionButton;
                if (selectedOptions[q.id] === optIndex) {
                  optionStyle += ` ${styles.optionSelected}`;
                }
                if (feedbackVisible) {
                  if (optIndex === q.correctIndex) optionStyle += ` ${styles.optionCorrect}`;
                  else if (selectedOptions[q.id] === optIndex) optionStyle += ` ${styles.optionIncorrect}`;
                }

                return (
                  <button
                    key={optIndex}
                    className={optionStyle}
                    onClick={() => handleOptionSelect(q.id, optIndex)}
                    disabled={feedbackVisible}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {!feedbackVisible ? (
              <div className={styles.questionActions}>
                <Button 
                  variant="primary" 
                  onClick={() => checkAnswer(q.id)}
                  disabled={selectedOptions[q.id] === undefined}
                >
                  Check Answer
                </Button>
              </div>
            ) : (
              <div className={`${styles.feedbackArea} ${isCorrect ? styles.feedbackSuccess : styles.feedbackError}`}>
                <div className={styles.feedbackTitle}>
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </div>
                <div className={`${styles.explanationText} rich-text-content`}>
                  <strong>Explanation:</strong> 
                  <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
