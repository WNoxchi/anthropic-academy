import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ToolInvocation } from "ai";
import {
  ToolInvocationBadge,
  getToolMessage,
} from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  overrides: Record<string, unknown> = {}
): ToolInvocation {
  return {
    toolCallId: "call_1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/components/Card.jsx" },
    state: "result",
    result: "Success",
    ...overrides,
  } as ToolInvocation;
}

test("shows 'Created' message for a completed create command", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation()} />);

  expect(screen.getByText("Created Card.jsx")).toBeDefined();
  expect(screen.queryByText("str_replace_editor")).toBeNull();
});

test("shows 'Creating' message while the create command is running", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({ state: "call", result: undefined })}
    />
  );

  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("shows 'Edited' message for str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: {
          command: "str_replace",
          path: "/App.jsx",
          old_str: "a",
          new_str: "b",
        },
      })}
    />
  );

  expect(screen.getByText("Edited App.jsx")).toBeDefined();
});

test("shows rename message with both file names for file_manager", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/components/Card.jsx",
          new_path: "/components/Panel.jsx",
        },
      })}
    />
  );

  expect(screen.getByText("Renamed Card.jsx → Panel.jsx")).toBeDefined();
});

test("shows delete message for file_manager", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "file_manager",
        args: { command: "delete", path: "/components/Card.jsx" },
      })}
    />
  );

  expect(screen.getByText("Deleted Card.jsx")).toBeDefined();
});

test("falls back to the raw tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "mystery_tool",
        args: { command: "create", path: "/Card.jsx" },
      })}
    />
  );

  expect(screen.getByText("mystery_tool")).toBeDefined();
});

test("falls back to the raw tool name when args are missing", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ args: {} })} />);

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("renders a spinner while running and a dot when complete", () => {
  const { container: running } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({ state: "call", result: undefined })}
    />
  );
  expect(running.querySelector(".animate-spin")).not.toBeNull();
  expect(running.querySelector(".bg-emerald-500")).toBeNull();

  const { container: complete } = render(
    <ToolInvocationBadge toolInvocation={makeInvocation()} />
  );
  expect(complete.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(complete.querySelector(".animate-spin")).toBeNull();
});

test("getToolMessage maps every str_replace_editor command", () => {
  const path = "/lib/utils.ts";
  expect(getToolMessage("str_replace_editor", { command: "view", path }, false)).toBe("Reading utils.ts");
  expect(getToolMessage("str_replace_editor", { command: "view", path }, true)).toBe("Read utils.ts");
  expect(getToolMessage("str_replace_editor", { command: "insert", path }, false)).toBe("Editing utils.ts");
  expect(getToolMessage("str_replace_editor", { command: "undo_edit", path }, false)).toBe("Undoing changes to utils.ts");
  expect(getToolMessage("str_replace_editor", { command: "undo_edit", path }, true)).toBe("Undid changes to utils.ts");
});

test("getToolMessage handles rename without a new_path", () => {
  expect(
    getToolMessage("file_manager", { command: "rename", path: "/Card.jsx" }, false)
  ).toBe("Renaming Card.jsx");
});
