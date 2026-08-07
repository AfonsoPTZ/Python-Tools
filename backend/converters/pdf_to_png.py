"""Este arquivo converte cada pagina de um PDF em um PNG separado, empacotados em um ZIP."""
import sys

import pypdfium2 as pdfium

from common import save_pages_as_zip_of_png


def convert_pdf_to_png(input_path: str, output_path: str) -> None:
    # O pypdfium2 renderiza cada pagina sem depender do Poppler no Windows.
    document = pdfium.PdfDocument(input_path)
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
        raise SystemExit('Uso: pdf_to_png.py <input_path> <output_path>')

    convert_pdf_to_png(sys.argv[1], sys.argv[2])
