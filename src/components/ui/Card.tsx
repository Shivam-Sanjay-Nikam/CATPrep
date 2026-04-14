import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  children, 
  variant = 'default',
  className = '',
  onClick,
  style
}) => {
  const combinedClasses = [
    styles.card,
    styles[variant],
    className
  ].join(' ').trim();

  return (
    <div className={combinedClasses} onClick={onClick} style={style}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </div>
  );
};
