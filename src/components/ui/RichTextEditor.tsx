'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadAsset } from '@/services/adminService';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder,
  minHeight = '200px'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
      Image.configure({
        HTMLAttributes: {
          class: styles.editorImage,
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setSourceValue(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
        style: `min-height: ${minHeight};`,
      },
    },
  });

  const toggleSourceMode = () => {
    if (isSourceMode) {
      editor?.commands.setContent(sourceValue);
    } else {
      setSourceValue(editor?.getHTML() || '');
    }
    setIsSourceMode(!isSourceMode);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setSourceValue(newVal);
    onChange(newVal);
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', `editor/${fileName}`);
        
        const url = await uploadAsset(formData);
        
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch (err) {
        console.error('Editor image upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    };
    
    input.click();
  };

  if (!editor) return null;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            active={editor.isActive('bold')}
            label="B"
            style={{ fontWeight: 700 }}
            disabled={isSourceMode}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            active={editor.isActive('italic')}
            label="I"
            style={{ fontStyle: 'italic' }}
            disabled={isSourceMode}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            active={editor.isActive('strike')}
            label="S"
            style={{ textDecoration: 'line-through' }}
            disabled={isSourceMode}
          />
        </div>

        <div className={styles.toolbarGroup}>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            active={editor.isActive('heading', { level: 2 })}
            label="H2"
            disabled={isSourceMode}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
            active={editor.isActive('heading', { level: 3 })}
            label="H3"
            disabled={isSourceMode}
          />
        </div>

        <div className={styles.toolbarGroup}>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            active={editor.isActive('bulletList')}
            label="• List"
            disabled={isSourceMode}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            active={editor.isActive('orderedList')}
            label="1. List"
            disabled={isSourceMode}
          />
        </div>

        <div className={styles.toolbarGroup}>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            active={editor.isActive('blockquote')}
            label="Quote"
            disabled={isSourceMode}
          />
          <ToolbarButton 
            onClick={addImage} 
            active={false}
            label={isUploading ? '...' : 'Img'}
            disabled={isUploading || isSourceMode}
          />
        </div>

        <div className={styles.toolbarGroup} style={{ marginLeft: 'auto', borderRight: 'none' }}>
          <ToolbarButton 
            onClick={toggleSourceMode} 
            active={isSourceMode}
            label={isSourceMode ? 'View Visual' : 'View Code </>'}
            style={{ 
              fontSize: '0.75rem', 
              width: 'auto', 
              padding: '0 1rem',
              color: isSourceMode ? 'white' : 'var(--primary)',
              background: isSourceMode ? 'var(--primary)' : 'transparent'
            }}
          />
        </div>
      </div>
      
      {isSourceMode ? (
        <div className={styles.codeWrapper}>
          <textarea
            className={styles.codeEditor}
            value={sourceValue}
            onChange={handleSourceChange}
            style={{ minHeight }}
            spellCheck={false}
          />
        </div>
      ) : (
        <EditorContent editor={editor} className={styles.editorWrapper} />
      )}
    </div>
  );
};

const ToolbarButton = ({ 
  onClick, 
  active, 
  label, 
  style, 
  disabled 
}: { 
  onClick: () => void; 
  active: boolean; 
  label: string | React.ReactNode; 
  style?: React.CSSProperties; 
  disabled?: boolean; 
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`${styles.toolbarBtn} ${active ? styles.active : ''}`}
    style={style}
  >
    {label}
  </button>
);
