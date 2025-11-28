/**
 * Markdown Editor Demo Page
 * Demonstrates the InputMarkdown component from @histweety/ui
 * Powered by MDXEditor with WYSIWYG editing experience
 */

"use client";

import { useState } from "react";
import { Button, InputMarkdown } from "@histweety/ui";

const defaultContent = `# Welcome to InputMarkdown

This is a **WYSIWYG** markdown editor powered by _MDXEditor_ with a Typora-like experience.

## Features

- **WYSIWYG Editing**: What you see is what you get - no separate preview mode
- **Rich Formatting**: Support for all standard markdown features
- **Built-in Toolbar**: Comprehensive toolbar with all editing tools
- **Perfect Newlines**: Blank lines and newlines are preserved exactly as typed
- **Keyboard Shortcuts**: Cmd/Ctrl+B (bold), Cmd/Ctrl+I (italic), and more

## Examples

### Code Block

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists

- Bullet points
- Easy to create
  - Nested items work too

1. Numbered lists
2. Are also supported
3. With proper formatting

### Task Lists

- [x] Create markdown editor
- [x] Add customizable toolbar
- [ ] Add more themes
- [ ] Add export functionality

### Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Toolbar | ✅ Done | High |
| Preview | ✅ Done | High |
| Themes | 🔄 WIP | Medium |

### Blockquotes

> "The best way to predict the future is to invent it."
> - Alan Kay

### Links and Images

[Visit GitHub](https://github.com)

![Markdown Logo](https://markdown-here.com/img/icon256.png)

---

## Try It Out!

Start editing this document or clear it and write your own content. Use the toolbar buttons or keyboard shortcuts to format your text.
`;

export default function MarkdownEditorPage() {
  const [content, setContent] = useState(defaultContent);
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const handleSave = () => {
    setSavedContent(content);
    console.log("Content saved:", content);
    // Here you could save to localStorage, API, etc.
    if (typeof window !== "undefined") {
      localStorage.setItem("markdown-content", content);
    }
  };

  const handleChange = (newContent: string) => {
    setContent(newContent);
  };

  const loadExample = () => {
    setContent(defaultContent);
    setEditorKey((prev) => prev + 1); // Force editor reset
  };

  const clearContent = () => {
    setContent("");
    setEditorKey((prev) => prev + 1); // Force editor reset
  };

  const wordCount = content.trim().split(/\s+/).filter((word) => word.length > 0).length;
  const charCount = content.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-white">Markdown Editor</h1>
          <p className="text-gray-400">
            WYSIWYG markdown editor powered by @histweety/ui
          </p>
        </div>

        {/* Controls */}
        <div className="mb-4 space-y-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button onClick={loadExample} size="md" mode="dark">
                Load Example
              </Button>
              <Button onClick={clearContent} size="md" mode="dark">
                Clear
              </Button>
              <Button onClick={handleSave} size="md" mode="dark">
                Save
              </Button>
            </div>

            {savedContent && (
              <div className="text-sm text-green-400">
                ✓ Last saved: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 border-t border-gray-700 pt-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-medium">Words:</span>
              <span className="text-white">{wordCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Characters:</span>
              <span className="text-white">{charCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className="text-blue-400">
                {content ? "Editing" : "Empty"}
              </span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <InputMarkdown
          key={editorKey}
          defaultValue={content}
          placeholder="Start writing your markdown here..."
          mode="dark"
          onChange={handleChange}
          className="min-h-[500px]"
        />

        {/* Info Section */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Features Card */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">✨ Features</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>WYSIWYG editing experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Rich text formatting toolbar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Tables, images, and links</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Code syntax highlighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Keyboard shortcuts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Dark/Light mode support</span>
              </li>
            </ul>
          </div>

          {/* Usage Card */}
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">📝 Basic Usage</h3>
            <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-xs">
              <code className="text-gray-300">{`import { InputMarkdown } from '@histweety/ui';

export default function MyPage() {
  const [content, setContent] = useState("");

  return (
    <InputMarkdown
      defaultValue={content}
      placeholder="Start writing..."
      mode="dark"
      onChange={setContent}
    />
  );
}`}</code>
            </pre>
          </div>
        </div>

        {/* Props Section */}
        <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-bold text-white">⚙️ Component Props</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg bg-gray-900/50 p-3">
              <code className="text-sm font-semibold text-blue-400">defaultValue</code>
              <p className="mt-1 text-xs text-gray-400">Initial markdown content</p>
            </div>
            <div className="rounded-lg bg-gray-900/50 p-3">
              <code className="text-sm font-semibold text-blue-400">placeholder</code>
              <p className="mt-1 text-xs text-gray-400">Placeholder text when empty</p>
            </div>
            <div className="rounded-lg bg-gray-900/50 p-3">
              <code className="text-sm font-semibold text-blue-400">mode</code>
              <p className="mt-1 text-xs text-gray-400">Theme: dark, light, or auto</p>
            </div>
            <div className="rounded-lg bg-gray-900/50 p-3">
              <code className="text-sm font-semibold text-blue-400">onChange</code>
              <p className="mt-1 text-xs text-gray-400">Content change callback</p>
            </div>
            <div className="rounded-lg bg-gray-900/50 p-3">
              <code className="text-sm font-semibold text-blue-400">readOnly</code>
              <p className="mt-1 text-xs text-gray-400">Make editor read-only</p>
            </div>
            <div className="rounded-lg bg-gray-900/50 p-3">
              <code className="text-sm font-semibold text-blue-400">className</code>
              <p className="mt-1 text-xs text-gray-400">Additional CSS classes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
