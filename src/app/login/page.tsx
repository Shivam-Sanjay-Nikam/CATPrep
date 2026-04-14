'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      router.push('/courses');
      router.refresh();
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
          {error && <div style={{ color: '#d32f2f', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="e.g. aspirant@iim.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          
          <Button variant="primary" fullWidth type="submit" style={{ marginTop: '1rem' }} isLoading={isLoading}>
            {isLoading ? 'Entering...' : 'Enter Sanctuary'}
          </Button>
        </form>
        
        <div className={styles.footer}>
          Don&apos;t have an account? <Link href="/signup">Join Elite</Link>
        </div>
      </Card>
    </Section>
  );
}
