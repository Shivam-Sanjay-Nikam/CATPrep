'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard' },
    { label: 'My Courses', path: '/dashboard/courses' },
    { label: 'Mock Series', path: '/dashboard/mocks' },
    { label: 'Performance', path: '/dashboard/performance' },
    { label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>
        ACADEMIC<span style={{ fontWeight: 300 }}>SANCTUARY</span>
      </Link>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className={styles.profile}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexGrow: 1 }}>
          <div className={styles.avatar}>
            {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
          </div>
          <div className={styles.info}>
            <span className={styles.name}>{user?.user_metadata?.full_name || 'Aspirant'}</span>
            <span className={styles.role}>Elite Plan</span>
          </div>
        </div>
        <button 
          onClick={logout}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '1.25rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-container-high)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          title="Logout"
        >
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.02em' }}>Out</span>
        </button>
      </div>
    </aside>
  );
};
