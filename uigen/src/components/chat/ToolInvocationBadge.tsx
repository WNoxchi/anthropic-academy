"use client";

import type { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function fileName(path: unknown): string | null {
  if (typeof path !== "string" || path.length === 0) return null;
  const name = path.split("/").filter(Boolean).pop();
  return name || null;
}

export function getToolMessage(
  toolName: string,
  args: Record<string, unknown> | undefined,
  completed: boolean
): string {
  const file = fileName(args?.path);

  if (toolName === "str_replace_editor" && file) {
    switch (args?.command) {
      case "create":
        return completed ? `Created ${file}` : `Creating ${file}`;
      case "str_replace":
      case "insert":
        return completed ? `Edited ${file}` : `Editing ${file}`;
      case "view":
        return completed ? `Read ${file}` : `Reading ${file}`;
      case "undo_edit":
        return completed
          ? `Undid changes to ${file}`
          : `Undoing changes to ${file}`;
    }
  }

  if (toolName === "file_manager" && file) {
    switch (args?.command) {
      case "rename": {
        const newFile = fileName(args?.new_path);
        const target = newFile ? `${file} → ${newFile}` : file;
        return completed ? `Renamed ${target}` : `Renaming ${target}`;
      }
      case "delete":
        return completed ? `Deleted ${file}` : `Deleting ${file}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({
  toolInvocation,
}: ToolInvocationBadgeProps) {
  const completed =
    toolInvocation.state === "result" && Boolean(toolInvocation.result);
  const message = getToolMessage(
    toolInvocation.toolName,
    toolInvocation.args,
    completed
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {completed ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
