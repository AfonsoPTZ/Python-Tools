"""Este arquivo concentra funcoes compartilhadas pelos conversores Python."""
import io
import shutil
import subprocess
import zipfile
from pathlib import Path

from PIL import Image


def find_executable(*names: str) -> str:
    # O helper testa mais de um nome porque a instalacao do executavel muda de uma maquina para outra.
    for name in names:
        resolved = shutil.which(name)
        if resolved:
            return resolved
    raise RuntimeError(f'Executavel nao encontrado: {", ".join(names)}')


def run_command(command: list[str]) -> None:
    # O wrapper dedicado facilita repassar erros do Python para o processo Node com uma mensagem unica.
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        message = completed.stderr.strip() or completed.stdout.strip() or 'Falha na execucao do comando.'
        raise RuntimeError(message)


def ensure_parent_dir(output_path: str) -> None:
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)


def save_pages_as_zip_of_png(images: list[Image.Image], output_path: str, name_prefix: str = 'pagina') -> None:
    # Cada pagina vira um PNG proprio dentro de um ZIP, em vez de uma unica imagem gigante empilhada.
    if not images:
        raise RuntimeError('Nenhuma pagina encontrada para exportar como imagem.')

    ensure_parent_dir(output_path)

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as archive:
        digits = len(str(len(images)))
        for index, image in enumerate(images, start=1):
            buffer = io.BytesIO()
            image.convert('RGB').save(buffer, format='PNG')
            page_number = str(index).zfill(digits)
            archive.writestr(f'{name_prefix}_{page_number}.png', buffer.getvalue())
