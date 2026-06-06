import os

from markitdown import MarkItDown, StreamInfo
from io import BytesIO
from pydantic import Field


def binary_document_to_markdown(binary_data: bytes, file_type: str) -> str:
    """Converts binary document data to markdown-formatted text."""
    md = MarkItDown()
    file_obj = BytesIO(binary_data)
    stream_info = StreamInfo(extension=file_type)
    result = md.convert(file_obj, stream_info=stream_info)
    return result.text_content


# Leading bytes used to verify a file's content matches its extension,
# since markitdown silently falls back to plain text for unrecognized data.
_MAGIC_BYTES: dict[str, bytes] = {
    "pdf": b"%PDF",
    "docx": b"PK",  # DOCX files are ZIP archives
}


def document_path_to_markdown(
    file_path: str = Field(
        description="Path to the PDF or DOCX file to convert. May be absolute "
        "or relative to the current working directory. The file type is "
        "inferred from the extension (case-insensitive)."
    ),
) -> str:
    """Convert a PDF or DOCX file on disk to markdown-formatted text.

    Reads the file at the given path and converts its contents to markdown,
    preserving document structure such as headings and lists. The file type
    is inferred from the path's extension, matched case-insensitively.

    When to use:
    - When you have a document on the local filesystem and want its contents
      as markdown text
    - When working with PDF or DOCX files referenced by path

    When not to use:
    - When you already have the document's raw bytes in memory (use
      binary_document_to_markdown instead)
    - For plain text or markdown files (read them directly)

    Raises FileNotFoundError if the path does not exist, and a conversion
    error if the file is empty, corrupt, or not a supported document format.

    Examples:
    >>> document_path_to_markdown("docs/report.pdf")
    '# Report Title\\n\\nReport contents...'
    >>> document_path_to_markdown("notes/meeting.docx")
    '# Meeting Notes\\n\\n- First item...'
    """
    file_type = os.path.splitext(file_path)[1].lstrip(".").lower()
    with open(file_path, "rb") as f:
        binary_data = f.read()

    expected_magic = _MAGIC_BYTES.get(file_type)
    if expected_magic is not None and not binary_data.startswith(expected_magic):
        raise ValueError(
            f"File {file_path!r} does not look like a valid {file_type} file"
        )

    return binary_document_to_markdown(binary_data, file_type)
