import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { testService } from '@/services/testService';
import { MockTestEditor } from './MockTestEditor';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditMockTestPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === 'new';
  
  let test = null;
  if (!isNew) {
    test = await testService.getTestById(id);
    if (!test) return notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />
      <div style={{ padding: '0 1.5rem' }}>
        <MockTestEditor initialTest={test} isNew={isNew} />
      </div>
    </main>
  );
}
