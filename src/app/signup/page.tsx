'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/layout/Section';
import styles from '../login/login.module.css';

export default function SignupPage() {
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetIIM: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

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
      setError(error.message);
      setIsLoading(false);
    } else {
      setIsLoading(false);
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
          {error && <div style={{ color: '#d32f2f', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="e.g. John Doe" 
              required 
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
          
          <Button variant="primary" fullWidth type="submit" style={{ marginTop: '1rem' }} isLoading={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className={styles.footer}>
          Already have an account? <Link href="/login">Log In</Link>
        </div>
      </Card>
    </Section>
  );
}
