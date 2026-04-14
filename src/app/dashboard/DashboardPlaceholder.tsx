import React from 'react';
import styles from './dashboard.module.css';

interface Props {
  title: string;
  description: string;
}

export default function DashboardPlaceholder({ title, description }: Props) {
  return (
    <div>
      <header className={styles.header}>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      
      <div style={{ 
        padding: '4rem', 
        border: '2px dashed rgba(118, 118, 131, 0.1)', 
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        color: 'var(--on-surface-variant)'
      }}>
        {title} module is currently under development to ensure the highest academic standards.
      </div>
    </div>
  );
}
