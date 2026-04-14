import React from 'react';
import { redirect } from 'next/navigation';
import { studentService } from '@/services/studentService';
import styles from '../dashboard.module.css';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const profile = await studentService.getProfile();
  if (!profile) redirect('/login');

  return (
    <>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your profile, preferences, and account security.</p>
      </header>
      <SettingsClient profile={{
        full_name: profile.name,
        email: profile.email || '',
        target_iim: profile.targetIIM,
        percentile_goal: profile.percentileGoal,
      }} />
    </>
  );
}
