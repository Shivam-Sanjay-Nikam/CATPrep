'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        ACADEMIC<span style={{ fontWeight: 300 }}>SANCTUARY</span>
      </Link>

      <div className={styles.links}>
        <Link href="/courses" className={styles.navLink}>Courses</Link>
        <Link href="/mock-tests" className={styles.navLink}>Mock Tests</Link>
        <Link href="/dashboard" className={styles.navLink}>My Dashboard</Link>
        {user?.email === 'shivamsanjaynikam17112002@gmail.com' && (
          <Link href="/admin" className={styles.navLink} style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Admin Portal
          </Link>
        )}
      </div>

      <div className={styles.actions}>
        {isAuthenticated ? (
          <div className={styles.userProfile}>
            <span className={styles.userName}>Hello, {user?.user_metadata?.full_name?.split(' ')[0] || 'Aspirant'}</span>
            <Button variant="text" onClick={logout} style={{ fontSize: '0.8125rem' }}>Logout</Button>
          </div>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button variant="text">Login</Button>
            </Link>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Join Elite</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
