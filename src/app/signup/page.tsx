'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import styles from '../login/login.module.css';
import { useToast } from '@/components/ui/ToastProvider';

export default function SignupPage() {
  const supabase = createClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetIIM: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          target_iim: formData.targetIIM,
        }
      }
    });

    if (error) {
      toast(error.message, 'error');
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setIsRedirecting(true);
      toast('Account created! Preparing your dashboard...', 'success');
      window.location.assign('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <Section background="surface" className={styles.container}>
      <Card className={styles.loginCard} variant="elevated">
        <Link href="/" className={styles.logo}>
          ACADEMIC<span style={{ fontWeight: 300 }}>SANCTUARY</span>
        </Link>
        <h2 className={styles.title}>Join the Elite</h2>
        <p className={styles.subtitle}>Begin your focused journey toward academic excellence.</p>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {isRedirecting && (
            <div style={{ padding: '1.5rem', background: '#f0f4ff', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', animation: 'pulse 2s infinite' }}>
              <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>Preparing your sanctuary...</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>One moment while we set up your personalized dashboard.</p>
            </div>
          )}
          
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="e.g. John Doe" 
              required 
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading || isRedirecting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="e.g. aspirant@example.com" 
              required 
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || isRedirecting}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Create Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading || isRedirecting}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="targetIIM">Target IIM</label>
            <input 
              type="text" 
              id="targetIIM" 
              placeholder="e.g. IIM Ahmedabad" 
              value={formData.targetIIM}
              onChange={handleChange}
              disabled={isLoading || isRedirecting}
            />
          </div>
          
          <Button variant="primary" fullWidth type="submit" style={{ marginTop: '1rem' }} isLoading={isLoading || isRedirecting}>
            {isRedirecting ? 'Redirecting...' : (isLoading ? 'Creating Account...' : 'Create Account')}
          </Button>
        </form>
        
        <div className={styles.footer}>
          Already have an account? <Link href="/login">Log In</Link>
        </div>
      </Card>
    </Section>
  );
}
