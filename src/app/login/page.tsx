'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import styles from './login.module.css';
import { useToast } from '@/components/ui/ToastProvider';

export default function LoginPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast(error.message, 'error');
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setIsRedirecting(true);
      toast('Login successful! Entering sanctuary...', 'success');
      // Full page load so middleware + RSC see the new session cookies (SPA navigate alone can race).
      window.location.assign('/courses');
    }
  };

  return (
    <Section background="surface" className={styles.container}>
      <Card className={styles.loginCard} variant="elevated">
        <Link href="/" className={styles.logo}>
          ACADEMIC<span style={{ fontWeight: 300 }}>SANCTUARY</span>
        </Link>
        <h2 className={styles.title}>Login to Your Sanctuary</h2>
        <p className={styles.subtitle}>Enter your credentials to access your personalized prep environment.</p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {isRedirecting && (
            <div style={{ padding: '1.5rem', background: '#f0f4ff', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', animation: 'pulse 2s infinite' }}>
              <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>Redirecting to sanctuary...</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Please wait while we prepare your space.</p>
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="e.g. aspirant@iim.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={isLoading || isRedirecting}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={isLoading || isRedirecting}
            />
          </div>
          
          <Button variant="primary" fullWidth type="submit" style={{ marginTop: '1rem' }} isLoading={isLoading || isRedirecting}>
            {isRedirecting ? 'Redirecting...' : (isLoading ? 'Entering...' : 'Enter Sanctuary')}
          </Button>
        </form>
        
        <div className={styles.footer}>
          Don&apos;t have an account? <Link href="/signup">Join Elite</Link>
        </div>
      </Card>
    </Section>
  );
}
