'use client';

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  BiBold,
  BiItalic,
  BiUnderline,
  BiStrikethrough,
  BiListUl,
  BiListOl,
  BiLink,
  BiCode,
  BiSolidQuoteLeft,
} from 'react-icons/bi';
import { cn } from '@/shared/lib/utils';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={isActive}
    className={cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
      'hover:bg-primary/10 hover:text-primary',
      'focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1',
      'disabled:pointer-events-none disabled:opacity-40',
      isActive
        ? 'bg-primary/15 text-primary'
        : 'text-muted-foreground'
    )}
  >
    {children}
  </button>
);

const ToolbarDivider: React.FC = () => (
  <div className="mx-1 h-5 w-px bg-border" />
);

interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor, disabled = false }) => {
  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-3 py-1.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={disabled}
        title="Bold"
      >
        <BiBold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={disabled}
        title="Italic"
      >
        <BiItalic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        disabled={disabled}
        title="Underline"
      >
        <BiUnderline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        disabled={disabled}
        title="Strikethrough"
      >
        <BiStrikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        disabled={disabled}
        title="Bullet list"
      >
        <BiListUl className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        disabled={disabled}
        title="Numbered list"
      >
        <BiListOl className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        disabled={disabled}
        title="Quote"
      >
        <BiSolidQuoteLeft className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        disabled={disabled}
        title="Inline code"
      >
        <BiCode className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        disabled={disabled}
        title="Insert link"
      >
        <BiLink className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
};

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Start typing...',
      className,
      editorClassName,
      label,
      error,
      disabled = false,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer',
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: value,
      editable: !disabled,
      onUpdate: ({ editor: updatedEditor }) => {
        onChange(updatedEditor.getHTML());
      },
    });

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value, { emitUpdate: false });
      }
    }, [editor, value]);

    useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [editor, disabled]);

    return (
      <div ref={ref} className={cn('flex flex-col mb-4', className)}>
        {label && (
          <label className="mb-2 text-sm text-foreground">{label}</label>
        )}

        <div
          className={cn(
            'overflow-hidden rounded-md border bg-background transition-colors',
            'border-input hover:border-primary/50',
            'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
            disabled && 'cursor-not-allowed opacity-60',
            error && 'border-destructive focus-within:border-destructive focus-within:ring-destructive'
          )}
        >
          <Toolbar editor={editor} disabled={disabled} />
          <EditorContent
            editor={editor}
            className={cn(
              'prose prose-sm max-w-none p-3',
              'min-h-[120px] max-h-[300px] overflow-y-auto',
              'text-sm text-foreground',
              '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px]',
              '[&_.ProseMirror_p.is-editor-empty:first-child]:before:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
              '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6',
              '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6',
              '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary/30 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted-foreground',
              '[&_.ProseMirror_code]:rounded-md [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:text-xs',
              '[&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-3',
              '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline',
              editorClassName
            )}
          />
        </div>

        {error && (
          <div className="mt-1.5 flex items-center text-xs text-destructive">
            <svg
              className="mr-1 h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
