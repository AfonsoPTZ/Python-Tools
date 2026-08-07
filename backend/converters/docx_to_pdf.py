"""Este arquivo converte documentos DOCX para PDF."""
import sys

from common import convert_office_to_pdf


def convert_docx_to_pdf(input_path: str, output_path: str) -> None:
    # O script isolado mantem o ponto de entrada simples para o processo filho do Node.
    convert_office_to_pdf(input_path, output_path)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Uso: docx_to_pdf.py <input_path> <output_path>')

    convert_docx_to_pdf(sys.argv[1], sys.argv[2])
