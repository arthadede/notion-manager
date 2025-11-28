/**
 * Types for the customizable Markdown Editor
 * These types allow developers to easily customize the editor menu and behavior
 */

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: string;
  action: (editor: EditorContext) => void;
  tooltip?: string;
  shortcut?: string;
  group?: string;
  separator?: boolean;
}

export interface EditorContext {
  insertText: (text: string) => void;
  wrapSelection: (before: string, after: string) => void;
  replaceSelection: (text: string) => void;
  getSelection: () => string;
  setContent: (content: string) => void;
  getContent: () => string;
}

export interface MarkdownEditorConfig {
  toolbar?: ToolbarAction[];
  enablePreview?: boolean;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  theme?: "light" | "dark" | "auto";
  showWordCount?: boolean;
  autoSave?: boolean;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

export interface ToolbarGroup {
  name: string;
  actions: ToolbarAction[];
}
