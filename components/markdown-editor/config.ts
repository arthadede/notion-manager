/**
 * Default Markdown Editor Configuration
 * Developers can easily customize this or provide their own configuration
 */

import { ToolbarAction, EditorContext } from "./types";

/**
 * Default toolbar actions
 * These are production-ready and can be easily extended or modified
 */
export const defaultToolbarActions: ToolbarAction[] = [
  // Text formatting
  {
    id: "bold",
    label: "Bold",
    icon: "B",
    tooltip: "Bold (Ctrl+B)",
    shortcut: "Ctrl+B",
    group: "format",
    action: (editor: EditorContext) => {
      editor.wrapSelection("**", "**");
    },
  },
  {
    id: "italic",
    label: "Italic",
    icon: "I",
    tooltip: "Italic (Ctrl+I)",
    shortcut: "Ctrl+I",
    group: "format",
    action: (editor: EditorContext) => {
      editor.wrapSelection("_", "_");
    },
  },
  {
    id: "strikethrough",
    label: "Strikethrough",
    icon: "S",
    tooltip: "Strikethrough",
    group: "format",
    action: (editor: EditorContext) => {
      editor.wrapSelection("~~", "~~");
    },
  },
  {
    id: "separator-1",
    label: "",
    separator: true,
    action: () => {},
  },
  // Headings
  {
    id: "heading-1",
    label: "H1",
    icon: "H1",
    tooltip: "Heading 1",
    group: "heading",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`# ${selection}`);
      } else {
        editor.insertText("# Heading 1");
      }
    },
  },
  {
    id: "heading-2",
    label: "H2",
    icon: "H2",
    tooltip: "Heading 2",
    group: "heading",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`## ${selection}`);
      } else {
        editor.insertText("## Heading 2");
      }
    },
  },
  {
    id: "heading-3",
    label: "H3",
    icon: "H3",
    tooltip: "Heading 3",
    group: "heading",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`### ${selection}`);
      } else {
        editor.insertText("### Heading 3");
      }
    },
  },
  {
    id: "separator-2",
    label: "",
    separator: true,
    action: () => {},
  },
  // Lists
  {
    id: "unordered-list",
    label: "Bullet List",
    icon: "•",
    tooltip: "Bullet List",
    group: "list",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        const lines = selection.split("\n");
        const listItems = lines.map((line) => `- ${line}`).join("\n");
        editor.replaceSelection(listItems);
      } else {
        editor.insertText("- List item");
      }
    },
  },
  {
    id: "ordered-list",
    label: "Numbered List",
    icon: "1.",
    tooltip: "Numbered List",
    group: "list",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        const lines = selection.split("\n");
        const listItems = lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
        editor.replaceSelection(listItems);
      } else {
        editor.insertText("1. List item");
      }
    },
  },
  {
    id: "checkbox",
    label: "Checklist",
    icon: "☑",
    tooltip: "Task List",
    group: "list",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        const lines = selection.split("\n");
        const listItems = lines.map((line) => `- [ ] ${line}`).join("\n");
        editor.replaceSelection(listItems);
      } else {
        editor.insertText("- [ ] Task item");
      }
    },
  },
  {
    id: "separator-3",
    label: "",
    separator: true,
    action: () => {},
  },
  // Links and images
  {
    id: "link",
    label: "Link",
    icon: "🔗",
    tooltip: "Insert Link (Ctrl+K)",
    shortcut: "Ctrl+K",
    group: "insert",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`[${selection}](url)`);
      } else {
        editor.insertText("[Link text](url)");
      }
    },
  },
  {
    id: "image",
    label: "Image",
    icon: "🖼",
    tooltip: "Insert Image",
    group: "insert",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`![${selection}](image-url)`);
      } else {
        editor.insertText("![Alt text](image-url)");
      }
    },
  },
  {
    id: "separator-4",
    label: "",
    separator: true,
    action: () => {},
  },
  // Code
  {
    id: "inline-code",
    label: "Code",
    icon: "`",
    tooltip: "Inline Code",
    group: "code",
    action: (editor: EditorContext) => {
      editor.wrapSelection("`", "`");
    },
  },
  {
    id: "code-block",
    label: "Code Block",
    icon: "{ }",
    tooltip: "Code Block",
    group: "code",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        editor.replaceSelection(`\`\`\`\n${selection}\n\`\`\``);
      } else {
        editor.insertText("```\ncode here\n```");
      }
    },
  },
  {
    id: "separator-5",
    label: "",
    separator: true,
    action: () => {},
  },
  // Other elements
  {
    id: "quote",
    label: "Quote",
    icon: '"',
    tooltip: "Blockquote",
    group: "block",
    action: (editor: EditorContext) => {
      const selection = editor.getSelection();
      if (selection) {
        const lines = selection.split("\n");
        const quote = lines.map((line) => `> ${line}`).join("\n");
        editor.replaceSelection(quote);
      } else {
        editor.insertText("> Blockquote");
      }
    },
  },
  {
    id: "horizontal-rule",
    label: "Divider",
    icon: "—",
    tooltip: "Horizontal Rule",
    group: "block",
    action: (editor: EditorContext) => {
      editor.insertText("\n---\n");
    },
  },
  {
    id: "table",
    label: "Table",
    icon: "⊞",
    tooltip: "Insert Table",
    group: "block",
    action: (editor: EditorContext) => {
      editor.insertText(
        "\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n"
      );
    },
  },
];

/**
 * Create a custom toolbar configuration
 * @param actions - Array of toolbar actions
 * @returns Toolbar configuration
 */
export function createToolbarConfig(actions: ToolbarAction[]): ToolbarAction[] {
  return actions;
}

/**
 * Get toolbar actions by group
 * @param group - Group name
 * @returns Filtered toolbar actions
 */
export function getToolbarActionsByGroup(group: string): ToolbarAction[] {
  return defaultToolbarActions.filter((action) => action.group === group);
}

/**
 * Example: Minimal toolbar configuration
 */
export const minimalToolbarActions: ToolbarAction[] = [
  defaultToolbarActions.find((a) => a.id === "bold")!,
  defaultToolbarActions.find((a) => a.id === "italic")!,
  defaultToolbarActions.find((a) => a.id === "link")!,
  defaultToolbarActions.find((a) => a.id === "heading-1")!,
  defaultToolbarActions.find((a) => a.id === "heading-2")!,
];

/**
 * Example: Code-focused toolbar configuration
 */
export const codeToolbarActions: ToolbarAction[] = [
  defaultToolbarActions.find((a) => a.id === "bold")!,
  defaultToolbarActions.find((a) => a.id === "italic")!,
  defaultToolbarActions.find((a) => a.id === "separator-1")!,
  defaultToolbarActions.find((a) => a.id === "inline-code")!,
  defaultToolbarActions.find((a) => a.id === "code-block")!,
  defaultToolbarActions.find((a) => a.id === "separator-2")!,
  defaultToolbarActions.find((a) => a.id === "unordered-list")!,
  defaultToolbarActions.find((a) => a.id === "ordered-list")!,
];
