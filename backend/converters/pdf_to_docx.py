"""Este arquivo converte PDF para DOCX, tentando preservar o layout original."""
import sys

from pdf2docx import Converter

from common import ensure_parent_dir


def convert_pdf_to_docx(input_path: str, output_path: str) -> None:
    # O pdf2docx analisa o layout do PDF (texto, tabelas, imagens) e recria a estrutura em um DOCX.
    ensure_parent_dir(output_path)
    converter = Converter(input_path)
    try:
        converter.convert(output_path)
    finally:
        converter.close()


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Uso: pdf_to_docx.py <input_path> <output_path>')

    convert_pdf_to_docx(sys.argv[1], sys.argv[2])
