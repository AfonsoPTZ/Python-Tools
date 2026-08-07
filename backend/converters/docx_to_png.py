"""Este arquivo converte DOCX para PNG (1 imagem por pagina) usando PDF como etapa intermediaria."""
import sys
import tempfile
from pathlib import Path

import pypdfium2 as pdfium

from common import convert_office_to_pdf, save_pages_as_zip_of_png


def convert_docx_to_png(input_path: str, output_path: str) -> None:
    # O DOCX vira PDF primeiro para reaproveitar o mesmo caminho de renderizacao e manter o codigo menor.
    with tempfile.TemporaryDirectory() as temp_dir:
        pdf_path = Path(temp_dir) / f'{Path(input_path).stem}.pdf'
        convert_office_to_pdf(input_path, str(pdf_path))

        document = pdfium.PdfDocument(str(pdf_path))
        images = []

        try:
            for page in document:
                bitmap = page.render(scale=2)
                images.append(bitmap.to_pil())
        finally:
            document.close()

        save_pages_as_zip_of_png(images, output_path)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Uso: docx_to_png.py <input_path> <output_path>')

    convert_docx_to_png(sys.argv[1], sys.argv[2])
