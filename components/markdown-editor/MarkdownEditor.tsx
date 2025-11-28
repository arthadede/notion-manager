/**
 * Production-Ready Markdown Editor Component
 * Features:
 * - Live preview
 * - Customizable toolbar
 * - Keyboard shortcuts
 * - Word count
 * - Auto-save support
 */

"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Toolbar } from "./Toolbar";
import { MarkdownEditorConfig, EditorContext } from "./types";
import { defaultToolbarActions } from "./config";

export function MarkdownEditor({
  toolbar = defaultToolbarActions,
  enablePreview = true,
  defaultValue = "",
  placeholder = "Start writing your markdown...",
  minHeight = "400px",
  maxHeight = "none",
  className = "",
  theme = "dark",
  showWordCount = true,
  autoSave = false,
  onChange,
  onSave,
}: MarkdownEditorConfig) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(defaultValue);
  const [showPreview, setShowPreview] = useState(enablePreview);

  // Calculate word and character count using useMemo
  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }, [content]);

  const charCount = useMemo(() => {
    return content.length;
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave) return;

    const timer = setTimeout(() => {
      onSave(content);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [content, autoSave, onSave]);

  // Handle content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
  };

  // Editor context for toolbar actions - memoized to prevent recreation
  const editorContext: EditorContext = useMemo(
    () => ({
      insertText: (text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + text + content.substring(end);

        setContent(newContent);
        onChange?.(newContent);

        // Set cursor position after inserted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
      },

      wrapSelection: (before: string, after: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const replacement = before + selectedText + after;
        const newContent = content.substring(0, start) + replacement + content.substring(end);

        setContent(newContent);
        onChange?.(newContent);

        // Restore selection
        setTimeout(() => {
          textarea.focus();
          if (selectedText) {
            textarea.setSelectionRange(start + before.length, end + before.length);
          } else {
            textarea.setSelectionRange(start + before.length, start + before.length);
          }
        }, 0);
      },

      replaceSelection: (text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + text + content.substring(end);

        setContent(newContent);
        onChange?.(newContent);

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
      },

      getSelection: () => {
        const textarea = textareaRef.current;
        if (!textarea) return "";

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        return content.substring(start, end);
      },

      setContent: (newContent: string) => {
        setContent(newContent);
        onChange?.(newContent);
      },

      getContent: () => content,
    }),
    [content, onChange]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+B for bold
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        editorContext.wrapSelection("**", "**");
      }
      // Ctrl+I for italic
      else if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        editorContext.wrapSelection("_", "_");
      }
      // Ctrl+K for link
      else if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        const selection = editorContext.getSelection();
        if (selection) {
          editorContext.replaceSelection(`[${selection}](url)`);
        } else {
          editorContext.insertText("[Link text](url)");
        }
      }
      // Ctrl+S for save
      else if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        onSave?.(content);
      }
      // Tab for indentation
      else if (e.key === "Tab") {
        e.preventDefault();
        editorContext.insertText("  ");
      }
    },
    [editorContext, content, onSave]
  );

  const themeClasses =
    theme === "dark"
      ? "bg-gray-900 text-gray-100"
      : theme === "light"
        ? "bg-white text-gray-900"
        : "bg-gray-900 text-gray-100";

  return (
    <div className={`flex flex-col rounded-lg border border-gray-700 ${themeClasses} ${className}`}>
      {/* Toolbar */}
      <Toolbar actions={toolbar} editorContext={editorContext} />

      {/* View Toggle */}
      {enablePreview && (
        <div className="flex gap-2 border-b border-gray-700 bg-gray-800/30 p-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              !showPreview
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              showPreview
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Preview
          </button>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="flex-1" style={{ minHeight, maxHeight }}>
        {!showPreview ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
            style={{ minHeight, maxHeight }}
          />
        ) : (
          <div className="h-full overflow-auto p-4">
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-gray-700 bg-gray-800/30 px-4 py-2 text-xs text-gray-400">
        <div className="flex gap-4">
          {showWordCount && (
            <>
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {autoSave && <span className="text-green-500">Auto-save enabled</span>}
          <span>Markdown</span>
        </div>
      </div>
    </div>
  );
}
