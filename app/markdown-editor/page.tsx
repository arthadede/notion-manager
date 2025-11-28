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
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState<string | null>(null);

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
  };

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <div className="flex gap-2">
            <Button onClick={loadExample} size="md" mode="dark">
              Load Example
            </Button>
            <Button onClick={() => setContent("")} size="md" mode="dark">
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

        {/* Editor */}
        <InputMarkdown
          key={content}
          defaultValue={content}
          placeholder="Start writing your markdown here..."
          mode="dark"
          onChange={handleChange}
          className="min-h-[500px]"
        />

        {/* Info Section */}
        <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h2 className="mb-4 text-2xl font-bold text-white">About InputMarkdown</h2>

          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="mb-2 font-semibold text-white">Features</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>✅ WYSIWYG editing (what you see is what you get)</li>
                <li>✅ Rich text formatting toolbar</li>
                <li>✅ Tables, images, links support</li>
                <li>✅ Code blocks with syntax highlighting</li>
                <li>✅ Perfect newline and blank line preservation</li>
                <li>✅ Keyboard shortcuts (Cmd/Ctrl+B, Cmd/Ctrl+I, etc.)</li>
                <li>✅ Dark mode support</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-white">Basic Usage</h3>
              <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm">
                <code>{`import { InputMarkdown } from '@histweety/ui';

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

            <div>
              <h3 className="mb-2 font-semibold text-white">Props</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li><code className="rounded bg-gray-700 px-2 py-1">defaultValue</code> - Initial markdown content</li>
                <li><code className="rounded bg-gray-700 px-2 py-1">placeholder</code> - Placeholder text when empty</li>
                <li><code className="rounded bg-gray-700 px-2 py-1">mode</code> - Theme mode: &quot;dark&quot;, &quot;light&quot;, or &quot;auto&quot;</li>
                <li><code className="rounded bg-gray-700 px-2 py-1">onChange</code> - Callback when content changes</li>
                <li><code className="rounded bg-gray-700 px-2 py-1">readOnly</code> - Make editor read-only</li>
                <li><code className="rounded bg-gray-700 px-2 py-1">className</code> - Additional CSS classes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
