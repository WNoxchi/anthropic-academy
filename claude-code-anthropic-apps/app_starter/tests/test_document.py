import os
import shutil
import pytest
from tools.document import binary_document_to_markdown, document_path_to_markdown


class TestBinaryDocumentToMarkdown:
    # Define fixture paths
    FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")
    DOCX_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.docx")
    PDF_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.pdf")

    def test_fixture_files_exist(self):
        """Verify test fixtures exist."""
        assert os.path.exists(self.DOCX_FIXTURE), (
            f"DOCX fixture not found at {self.DOCX_FIXTURE}"
        )
        assert os.path.exists(self.PDF_FIXTURE), (
            f"PDF fixture not found at {self.PDF_FIXTURE}"
        )

    def test_binary_document_to_markdown_with_docx(self):
        """Test converting a DOCX document to markdown."""
        # Read binary content from the fixture
        with open(self.DOCX_FIXTURE, "rb") as f:
            docx_data = f.read()

        # Call function
        result = binary_document_to_markdown(docx_data, "docx")

        # Basic assertions to check the conversion was successful
        assert isinstance(result, str)
        assert len(result) > 0
        # Check for typical markdown formatting - this will depend on your actual test file
        assert "#" in result or "-" in result or "*" in result

    def test_binary_document_to_markdown_with_pdf(self):
        """Test converting a PDF document to markdown."""
        # Read binary content from the fixture
        with open(self.PDF_FIXTURE, "rb") as f:
            pdf_data = f.read()

        # Call function
        result = binary_document_to_markdown(pdf_data, "pdf")

        # Basic assertions to check the conversion was successful
        assert isinstance(result, str)
        assert len(result) > 0
        # Check for typical markdown formatting - this will depend on your actual test file
        assert "#" in result or "-" in result or "*" in result


class TestDocumentPathToMarkdown:
    # Define fixture paths
    FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")
    DOCX_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.docx")
    PDF_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.pdf")

    def test_document_path_to_markdown_with_pdf(self):
        """Test converting a PDF document by path to markdown."""
        result = document_path_to_markdown(self.PDF_FIXTURE)

        assert isinstance(result, str)
        assert len(result) > 0
        # Check for typical markdown formatting - this will depend on your actual test file
        assert "#" in result or "-" in result or "*" in result

    def test_document_path_to_markdown_with_docx(self):
        """Test converting a DOCX document by path to markdown."""
        result = document_path_to_markdown(self.DOCX_FIXTURE)

        assert isinstance(result, str)
        assert len(result) > 0
        # Check for typical markdown formatting - this will depend on your actual test file
        assert "#" in result or "-" in result or "*" in result

    def test_matches_binary_conversion_for_pdf(self):
        """Path-based conversion should match the binary tool's output."""
        with open(self.PDF_FIXTURE, "rb") as f:
            pdf_data = f.read()

        assert document_path_to_markdown(self.PDF_FIXTURE) == (
            binary_document_to_markdown(pdf_data, "pdf")
        )

    def test_matches_binary_conversion_for_docx(self):
        """Path-based conversion should match the binary tool's output."""
        with open(self.DOCX_FIXTURE, "rb") as f:
            docx_data = f.read()

        assert document_path_to_markdown(self.DOCX_FIXTURE) == (
            binary_document_to_markdown(docx_data, "docx")
        )

    def test_uppercase_extension(self, tmp_path):
        """Extension matching should not be case-sensitive."""
        uppercase_copy = tmp_path / "MCP_DOCS.PDF"
        shutil.copyfile(self.PDF_FIXTURE, uppercase_copy)

        result = document_path_to_markdown(str(uppercase_copy))

        assert isinstance(result, str)
        assert len(result) > 0

    def test_nonexistent_path(self):
        """A path that does not exist should raise FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            document_path_to_markdown(
                os.path.join(self.FIXTURES_DIR, "does_not_exist.pdf")
            )

    def test_path_is_a_directory(self):
        """Passing a directory should raise rather than return junk."""
        with pytest.raises((IsADirectoryError, PermissionError, OSError)):
            document_path_to_markdown(self.FIXTURES_DIR)

    def test_corrupt_file(self, tmp_path):
        """Garbage bytes with a valid extension should raise, not succeed."""
        corrupt_file = tmp_path / "fake.pdf"
        corrupt_file.write_bytes(b"this is not a real pdf")

        with pytest.raises(Exception):
            document_path_to_markdown(str(corrupt_file))

    def test_empty_file(self, tmp_path):
        """A zero-byte file should fail clearly, not return an empty success."""
        empty_file = tmp_path / "empty.pdf"
        empty_file.write_bytes(b"")

        with pytest.raises(Exception):
            document_path_to_markdown(str(empty_file))

    def test_relative_path(self, monkeypatch):
        """Relative paths should resolve against the current working directory."""
        monkeypatch.chdir(self.FIXTURES_DIR)

        result = document_path_to_markdown("mcp_docs.pdf")

        assert isinstance(result, str)
        assert len(result) > 0
