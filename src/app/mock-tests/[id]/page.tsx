import React from 'react';
import { notFound } from 'next/navigation';
import { testService } from '@/services/testService';
import MockTestClient from './MockTestClient';

interface Props {
  params: { id: string };
}

export default async function MockTestPage({ params }: Props) {
  const { id } = await params;
  const test = await testService.getTestById(id);

  if (!test) {
    return notFound();
  }

  return <MockTestClient test={test} />;
}
