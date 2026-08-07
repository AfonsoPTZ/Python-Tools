"""Este arquivo normaliza imagens para o formato PNG."""
import sys

from PIL import Image

from common import ensure_parent_dir


def convert_image_to_png(input_path: str, output_path: str) -> None:
    # Imagens que nao sao PNG sao convertidas para RGBA primeiro para preservar transparencia quando existir.
    ensure_parent_dir(output_path)
    with Image.open(input_path) as image:
        image.convert('RGBA').save(output_path, format='PNG')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Uso: image_to_png.py <input_path> <output_path>')

    convert_image_to_png(sys.argv[1], sys.argv[2])