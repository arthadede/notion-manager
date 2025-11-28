/**
 * Customizable Toolbar Component for Markdown Editor
 * Production-ready and easily customizable
 */

import React from "react";
import { ToolbarAction, EditorContext } from "./types";

interface ToolbarProps {
  actions: ToolbarAction[];
  editorContext: EditorContext;
  className?: string;
}

export function Toolbar({ actions, editorContext, className = "" }: ToolbarProps) {
  const handleAction = (action: ToolbarAction) => {
    action.action(editorContext);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1 border-b border-gray-700 bg-gray-800/50 p-2 ${className}`}
      role="toolbar"
      aria-label="Markdown formatting toolbar"
    >
      {actions.map((action) => {
        if (action.separator) {
          return (
            <div
              key={action.id}
              className="mx-1 h-6 w-px bg-gray-600"
              role="separator"
              aria-orientation="vertical"
            />
          );
        }

        return (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            className="group relative rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 transition-all hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            title={action.tooltip}
            aria-label={action.label}
          >
            <span className="font-semibold">{action.icon || action.label}</span>

            {/* Tooltip */}
            {action.tooltip && (
              <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-gray-200 opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                {action.tooltip}
                {action.shortcut && (
                  <span className="ml-2 text-gray-400">({action.shortcut})</span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
