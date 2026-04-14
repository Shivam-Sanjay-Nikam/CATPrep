'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

interface ProfileData {
  full_name: string;
  target_iim: string;
  percentile_goal: string;
  email: string;
}

export default function SettingsClient({ profile }: { profile: ProfileData }) {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMessage, setPwMessage] = useState('');

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: form.full_name,
        target_iim: form.target_iim,
        percentile_goal: form.percentile_goal,
      }
    });
    setSaving(false);
    if (error) setMessage('Error: ' + error.message);
    else { setMessage('Profile saved!'); router.refresh(); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { setPwMessage('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 6) { setPwMessage('Password must be at least 6 characters.'); return; }
    setChangingPassword(true);
    setPwMessage('');
    const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
    setChangingPassword(false);
    if (error) setPwMessage('Error: ' + error.message);
    else { setPwMessage('Password changed successfully!'); setPwForm({ current: '', newPw: '', confirm: '' }); }
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.875rem 1rem',
    border: '1.5px solid var(--outline-variant)',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    width: '100%',
    background: 'var(--surface-container-lowest)',
    fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
    display: 'block',
  };

  return (
    <>
      {/* Profile Settings */}
      <Card style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '2rem' }}>Profile Settings</h2>
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={form.email} disabled />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Target IIM</label>
              <select style={inputStyle} value={form.target_iim}
                onChange={e => setForm(p => ({ ...p, target_iim: e.target.value }))}>
                {['IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'IIM Lucknow', 'IIM Kozhikode', 'IIM Indore'].map(iim => (
                  <option key={iim}>{iim}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Percentile Goal</label>
              <select style={inputStyle} value={form.percentile_goal}
                onChange={e => setForm(p => ({ ...p, percentile_goal: e.target.value }))}>
                {['95.0', '97.0', '98.0', '99.0', '99.5', '99.9'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          {message && (
            <div style={{ color: message.startsWith('Error') ? '#c62828' : '#2e7d32', fontWeight: 600, fontSize: '0.9rem' }}>
              {message}
            </div>
          )}
          <div>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Password Change */}
      <Card style={{ padding: '2.5rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '2rem' }}>Change Password</h2>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '480px' }}>
          <div>
            <label style={labelStyle}>New Password</label>
            <input style={inputStyle} type="password" value={pwForm.newPw} placeholder="Min. 6 characters"
              onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input style={inputStyle} type="password" value={pwForm.confirm} placeholder="Repeat password"
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
          </div>
          {pwMessage && (
            <div style={{ color: pwMessage.startsWith('Error') || pwMessage.includes('not') ? '#c62828' : '#2e7d32', fontWeight: 600, fontSize: '0.9rem' }}>
              {pwMessage}
            </div>
          )}
          <div>
            <Button variant="primary" type="submit" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
