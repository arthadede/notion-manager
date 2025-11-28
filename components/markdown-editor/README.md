# Markdown Editor

A production-ready, open-source markdown editor with a fully customizable toolbar menu. Built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ **Open Source**: MIT licensed, free to use and modify
- ✅ **Production Ready**: Built with TypeScript and best practices
- ✅ **Fully Customizable**: Easy to customize toolbar, themes, and behavior
- ✅ **Live Preview**: Real-time markdown rendering
- ✅ **Keyboard Shortcuts**: Common shortcuts for faster editing
- ✅ **Word Count**: Built-in word and character counter
- ✅ **Auto-save**: Optional auto-save functionality
- ✅ **Accessible**: ARIA labels and keyboard navigation
- ✅ **GitHub Flavored Markdown**: Support for tables, task lists, and more

## Installation

The editor is already installed in this project. Dependencies:

```bash
npm install react-markdown remark-gfm rehype-raw rehype-sanitize
```

## Basic Usage

```tsx
import { MarkdownEditor } from '@/components/markdown-editor';

export default function MyPage() {
  return (
    <MarkdownEditor
      defaultValue="# Hello World"
      onChange={(content) => console.log(content)}
    />
  );
}
```

## Customization

### 1. Using Pre-built Toolbars

We provide several pre-configured toolbars:

```tsx
import {
  MarkdownEditor,
  defaultToolbarActions,    // Full toolbar with all features
  minimalToolbarActions,    // Minimal toolbar (bold, italic, headings, link)
  codeToolbarActions        // Code-focused toolbar
} from '@/components/markdown-editor';

<MarkdownEditor toolbar={minimalToolbarActions} />
```

### 2. Creating Custom Toolbar

Create your own toolbar by defining actions:

```tsx
import { ToolbarAction } from '@/components/markdown-editor';

const myToolbar: ToolbarAction[] = [
  {
    id: 'bold',
    label: 'Bold',
    icon: 'B',
    tooltip: 'Bold text',
    action: (editor) => editor.wrapSelection('**', '**'),
  },
  {
    id: 'italic',
    label: 'Italic',
    icon: 'I',
    tooltip: 'Italic text',
    action: (editor) => editor.wrapSelection('_', '_'),
  },
  {
    id: 'separator',
    label: '',
    separator: true,
    action: () => {},
  },
  {
    id: 'heading',
    label: 'H1',
    icon: 'H1',
    tooltip: 'Heading 1',
    action: (editor) => {
      const selection = editor.getSelection();
      editor.replaceSelection(`# ${selection || 'Heading'}`);
    },
  },
];

<MarkdownEditor toolbar={myToolbar} />
```

### 3. Adding Custom Actions

Create custom toolbar actions for your specific needs:

```tsx
const insertTemplate: ToolbarAction = {
  id: 'template',
  label: 'Template',
  icon: '📋',
  tooltip: 'Insert Template',
  group: 'custom',
  action: (editor) => {
    const template = `## Meeting Notes

**Date:** ${new Date().toLocaleDateString()}

### Attendees
-

### Agenda
1.

### Action Items
- [ ]
`;
    editor.insertText(template);
  },
};

const myToolbar = [...defaultToolbarActions, insertTemplate];
```

### 4. Editor Context Methods

The `EditorContext` provides these methods for toolbar actions:

- `insertText(text: string)` - Insert text at cursor position
- `wrapSelection(before: string, after: string)` - Wrap selected text
- `replaceSelection(text: string)` - Replace selected text
- `getSelection()` - Get currently selected text
- `setContent(content: string)` - Set entire editor content
- `getContent()` - Get entire editor content

### 5. Configuration Options

```tsx
<MarkdownEditor
  // Toolbar configuration
  toolbar={defaultToolbarActions}

  // Preview settings
  enablePreview={true}

  // Content
  defaultValue="Initial content"
  placeholder="Start typing..."

  // Size
  minHeight="400px"
  maxHeight="800px"

  // Styling
  className="my-custom-class"
  theme="dark"  // 'light' | 'dark' | 'auto'

  // Features
  showWordCount={true}
  autoSave={true}

  // Callbacks
  onChange={(content) => console.log(content)}
  onSave={(content) => saveToBackend(content)}
/>
```

## Advanced Examples

### Example 1: Custom AI-Assisted Editor

```tsx
const aiToolbar: ToolbarAction[] = [
  ...defaultToolbarActions,
  {
    id: 'ai-improve',
    label: 'AI Improve',
    icon: '🤖',
    tooltip: 'Improve with AI',
    action: async (editor) => {
      const selection = editor.getSelection();
      if (!selection) return;

      // Call your AI API
      const improved = await improveWithAI(selection);
      editor.replaceSelection(improved);
    },
  },
];
```

### Example 2: Template Library

```tsx
const templates = {
  meeting: '## Meeting Notes\n\n...',
  blog: '# Blog Post Title\n\n...',
  documentation: '# Documentation\n\n...',
};

const templateActions: ToolbarAction[] = Object.entries(templates).map(
  ([name, content]) => ({
    id: `template-${name}`,
    label: name.charAt(0).toUpperCase() + name.slice(1),
    tooltip: `Insert ${name} template`,
    action: (editor) => editor.insertText(content),
  })
);
```

### Example 3: Integration with State Management

```tsx
import { useState, useEffect } from 'react';

export function IntegratedEditor() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {isSaving && <div>Saving...</div>}
      <MarkdownEditor
        defaultValue={content}
        onChange={setContent}
        onSave={handleSave}
        autoSave={true}
      />
    </div>
  );
}
```

## Keyboard Shortcuts

- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+K` - Insert link
- `Ctrl+S` - Save (if onSave callback is provided)
- `Tab` - Insert indent (2 spaces)

## Styling

The editor uses Tailwind CSS classes and can be customized via:

1. **Theme prop**: Set `theme="light"` or `theme="dark"`
2. **Custom CSS**: Add className to override styles
3. **Tailwind config**: Extend the theme in `tailwind.config.ts`

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## License

MIT License - Free to use in personal and commercial projects

## Contributing

This is part of the notion-manager project. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

For issues or questions:
- Check the example page at `/markdown-editor`
- Review the code in `components/markdown-editor/`
- Open an issue in the project repository

## Roadmap

Potential future enhancements:

- [ ] More themes (solarized, monokai, etc.)
- [ ] Export to PDF/HTML
- [ ] Collaborative editing
- [ ] Image upload support
- [ ] Spell checker integration
- [ ] Mobile optimization
- [ ] Plugin system
- [ ] Syntax highlighting themes

---

**Built with ❤️ for developers who love markdown**
