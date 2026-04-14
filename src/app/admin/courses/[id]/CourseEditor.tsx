'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertCourse, uploadAsset } from '@/services/adminService';
import { Course } from '@/types';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import styles from './editor.module.css';

interface CourseEditorProps {
  initialCourse?: Course | null;
  isNew?: boolean;
}

export const CourseEditor: React.FC<CourseEditorProps> = ({ initialCourse, isNew }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Partial<Course>>(initialCourse || {
    id: '',
    title: '',
    description: '',
    instructor: 'Alumni, IIM Ahmedabad',
    duration: '20 Hours',
    difficulty: 'Beginner',
    tags: [],
    price: 0,
    thumbnail: ''
  });

  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', `thumbnails/${fileName}`);
      
      const publicUrl = await uploadAsset(formData);
      setCourse(prev => ({ ...prev, thumbnail: publicUrl }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload thumbnail');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course.id || !course.title) {
      alert('ID and Title are required');
      return;
    }

    setLoading(true);
    try {
      await upsertCourse(course);
      alert('Course saved successfully!');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save course. Check permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.editorContainer} onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: '2.5rem' }}>{isNew ? 'Create New Course' : 'Edit Course Metadata'}</h2>

      <div className={styles.formGroup}>
        <label>Course ID (Slug)</label>
        <input 
          className={styles.input}
          placeholder="e.g., algebra-101"
          value={course.id}
          onChange={e => setCourse(prev => ({ ...prev, id: e.target.value }))}
          disabled={!isNew}
          required
        />
        {isNew && <small style={{ color: 'var(--on-surface-variant)' }}>This will be used in the URL.</small>}
      </div>

      <div className={styles.formGroup}>
        <label>Title</label>
        <input 
          className={styles.input}
          placeholder="Professional Course Title"
          value={course.title}
          onChange={e => setCourse(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Description</label>
        <textarea 
          className={styles.textarea}
          placeholder="What will students learn in this course?"
          value={course.description}
          onChange={e => setCourse(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className={styles.formGroup}>
          <label>Instructor</label>
          <input 
            className={styles.input}
            value={course.instructor}
            onChange={e => setCourse(prev => ({ ...prev, instructor: e.target.value }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Price (INR)</label>
          <input 
            type="number"
            className={styles.input}
            value={course.price}
            onChange={e => setCourse(prev => ({ ...prev, price: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className={styles.formGroup}>
          <label>Difficulty</label>
          <select 
            className={styles.select}
            value={course.difficulty}
            onChange={e => setCourse(prev => ({ ...prev, difficulty: e.target.value as Course['difficulty'] }))}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Tags (Comma separated)</label>
          <input 
            className={styles.input}
            placeholder="Quant, Geometry, CAT"
            value={course.tags?.join(', ')}
            onChange={e => setCourse(prev => ({ ...prev, tags: e.target.value.split(',').map(s => s.trim()) }))}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Course Thumbnail</label>
        <div className={styles.uploadArea} onClick={() => document.getElementById('thumbnailInput')?.click()}>
          {uploading ? (
            <p>Uploading...</p>
          ) : (
            <p>Click to upload course image</p>
          )}
          <input 
            type="file" 
            id="thumbnailInput" 
            hidden 
            accept="image/*"
            onChange={handleUpload}
          />
        </div>
        {course.thumbnail && (
          <div className={styles.preview}>
            <Image src={course.thumbnail} alt="Thumbnail preview" fill style={{ objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" type="submit" disabled={loading} style={{ flexGrow: 1 }}>
          {loading ? 'Saving...' : 'Save Course Metadata'}
        </Button>
        <Button variant="outline" type="button" onClick={() => router.push('/admin')}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
