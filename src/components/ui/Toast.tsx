'use client';

import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.type !== 'loading' && toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose(toast.id), 300); // Wait for exit animation
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exit : styles.enter}`}>
      <div className={styles.content}>
        {toast.type === 'loading' && <div className={styles.spinner}></div>}
        <span>{toast.message}</span>
      </div>
      {toast.type !== 'loading' && (
        <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
      )}
    </div>
  );
};
