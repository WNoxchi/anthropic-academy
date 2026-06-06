# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

All code lives in `app_starter/` — a Python package of document-related tools (converting/processing document formats) exposed through an MCP server built with `FastMCP`. Run all commands from inside `app_starter/`.

## Commands

```bash
# One-time setup: create venv and install in development mode
uv venv
source .venv/bin/activate
uv pip install -e .

# Start the MCP server
uv run main.py

# Run all tests
uv run pytest

# Run a single test file or test
uv run pytest tests/test_document.py
uv run pytest tests/test_document.py::TestBinaryDocumentToMarkdown::test_binary_document_to_markdown_with_pdf
```

## Architecture

- `main.py` — MCP server entry point. Creates the `FastMCP("docs")` server and registers tools.
- `tools/` — tool implementations as plain Python functions (e.g. `tools/document.py` uses `markitdown` for binary→markdown conversion, `tools/math.py`).
- `tests/` — pytest tests; binary fixtures (`.docx`, `.pdf`) live in `tests/fixtures/`.

A tool is just a function in `tools/`; it only becomes an MCP tool once registered in `main.py`.

## Code Style

- Always apply appropriate type annotations to function arguments (and return types).

## Defining MCP Tools

Tools are defined as Python functions and registered with the MCP server in `main.py`:

```python
mcp.tool()(my_function)
```

Tool descriptions (docstrings) should:

- Begin with a one-line summary
- Provide detailed explanation of functionality
- Explain when to use (and not use) the tool
- Include usage examples with expected input/output

Use `Field` from pydantic for parameter descriptions:

```python
from pydantic import Field

def my_tool(
    param1: str = Field(description="Detailed description of this parameter"),
    param2: int = Field(description="Explain what this parameter does")
) -> ReturnType:
    """Comprehensive docstring here"""
    # Implementation
```

See `tools/math.py::add` for a complete example of this docstring and `Field` style.
