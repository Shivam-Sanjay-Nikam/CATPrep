'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastItem, ToastType } from './Toast';
import styles from './ToastProvider.module.css';

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  showLoading: (message: string) => string;
  hideLoading: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration?: number): string => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, duration: duration !== undefined ? duration : 3000 }]);
    return id;
  }, []);

  const showLoading = useCallback((message: string): string => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type: 'loading', duration: Infinity }]);
    return id;
  }, []);

  const hideLoading = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, removeToast, showLoading, hideLoading }}>
      {children}
      <div className={styles.container}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
