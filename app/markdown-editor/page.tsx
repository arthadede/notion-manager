/**
 * Markdown Editor Demo Page
 * Demonstrates the production-ready, customizable markdown editor
 */

"use client";

import { useState } from "react";
import { MarkdownEditor, defaultToolbarActions, minimalToolbarActions } from "@/components/markdown-editor";

const defaultContent = `# Welcome to Markdown Editor

This is a **production-ready**, _open-source_ markdown editor with a fully customizable menu.

## Features

- **Easy to Customize**: Modify toolbar actions via simple configuration
- **Production Ready**: Built with TypeScript and best practices
- **Rich Formatting**: Support for all standard markdown features
- **Live Preview**: See your markdown rendered in real-time
- **Keyboard Shortcuts**: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link), Ctrl+S (save)

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
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [toolbarMode, setToolbarMode] = useState<"full" | "minimal">("full");

  const handleSave = (content: string) => {
    setSavedContent(content);
    console.log("Content saved:", content);
    // Here you could save to localStorage, API, etc.
    if (typeof window !== "undefined") {
      localStorage.setItem("markdown-content", content);
    }
  };

  const handleChange = (content: string) => {
    setContent(content);
  };

  const loadExample = () => {
    setContent(defaultContent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-white">Markdown Editor</h1>
          <p className="text-gray-400">
            Open source, customizable, and production-ready
          </p>
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <div className="flex gap-2">
            <button
              onClick={loadExample}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Load Example
            </button>
            <button
              onClick={() => setContent("")}
              className="rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              onClick={() => handleSave(content)}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Save
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Toolbar:</span>
            <button
              onClick={() => setToolbarMode("full")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                toolbarMode === "full"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setToolbarMode("minimal")}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                toolbarMode === "minimal"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Minimal
            </button>
          </div>

          {savedContent && (
            <div className="text-sm text-green-400">
              ✓ Last saved: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Editor */}
        <MarkdownEditor
          defaultValue={content}
          toolbar={toolbarMode === "full" ? defaultToolbarActions : minimalToolbarActions}
          enablePreview={true}
          placeholder="Start writing your markdown here..."
          minHeight="500px"
          theme="dark"
          showWordCount={true}
          autoSave={false}
          onChange={handleChange}
          onSave={handleSave}
        />

        {/* Info Section */}
        <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">How to Customize</h2>

          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="mb-2 font-semibold text-white">1. Use Pre-built Toolbars</h3>
              <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm">
                <code>{`import { MarkdownEditor, minimalToolbarActions } from '@/components/markdown-editor';

<MarkdownEditor
  toolbar={minimalToolbarActions}
/>`}</code>
              </pre>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-white">2. Create Custom Toolbar</h3>
              <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm">
                <code>{`import { ToolbarAction } from '@/components/markdown-editor';

const customToolbar: ToolbarAction[] = [
  {
    id: 'bold',
    label: 'Bold',
    icon: 'B',
    action: (editor) => editor.wrapSelection('**', '**'),
  },
  // Add more actions...
];

<MarkdownEditor toolbar={customToolbar} />`}</code>
              </pre>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-white">3. Add Custom Actions</h3>
              <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm">
                <code>{`const myCustomAction: ToolbarAction = {
  id: 'insert-template',
  label: 'Template',
  icon: '📋',
  tooltip: 'Insert Template',
  action: (editor) => {
    editor.insertText('## Your Template Here\\n\\nContent...');
  },
};`}</code>
              </pre>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-white">Keyboard Shortcuts</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li><kbd className="rounded bg-gray-700 px-2 py-1">Ctrl+B</kbd> - Bold</li>
                <li><kbd className="rounded bg-gray-700 px-2 py-1">Ctrl+I</kbd> - Italic</li>
                <li><kbd className="rounded bg-gray-700 px-2 py-1">Ctrl+K</kbd> - Insert Link</li>
                <li><kbd className="rounded bg-gray-700 px-2 py-1">Ctrl+S</kbd> - Save</li>
                <li><kbd className="rounded bg-gray-700 px-2 py-1">Tab</kbd> - Indent</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
