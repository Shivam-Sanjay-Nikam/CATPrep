import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  background?: 'surface' | 'lowest' | 'container' | 'primary';
  className?: string;
  container?: boolean;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  background = 'surface',
  className = '',
  container = true
}) => {
  const bgMap = {
    surface: 'var(--surface)',
    lowest: 'var(--surface-container-lowest)',
    container: 'var(--surface-container)',
    primary: 'var(--primary)',
  };

  const style: React.CSSProperties = {
    backgroundColor: bgMap[background],
    width: '100%',
  };

  const containerStyle: React.CSSProperties = container ? {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
  } : {};

  return (
    <section className={`section-padding ${className}`} style={style}>
      <div style={containerStyle}>
        {children}
      </div>
    </section>
  );
};
