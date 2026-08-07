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


# Caminhos padrao do instalador do LibreOffice no Windows, usados quando o "soffice" nao esta no PATH.
_known_soffice_paths = [
    r'C:\Program Files\LibreOffice\program\soffice.exe',
    r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
]


def find_soffice() -> str | None:
    resolved = shutil.which('soffice') or shutil.which('libreoffice')
    if resolved:
        return resolved

    for known_path in _known_soffice_paths:
        if Path(known_path).exists():
            return known_path

    return None


def run_command(command: list[str]) -> None:
    # O wrapper dedicado facilita repassar erros do Python para o processo Node com uma mensagem unica.
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode != 0:
        message = completed.stderr.strip() or completed.stdout.strip() or 'Falha na execucao do comando.'
        raise RuntimeError(message)


def ensure_parent_dir(output_path: str) -> None:
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)


def convert_office_to_pdf(input_path: str, output_path: str) -> None:
    """Converte documentos DOCX, XLSX ou PPTX para PDF via LibreOffice (com fallback para docx2pdf em DOCX)."""
    soffice = find_soffice()

    if soffice:
        # O LibreOffice e a rota preferida porque converte qualquer formato de escritorio diretamente na maquina local.
        ensure_parent_dir(output_path)
        run_command([
            soffice,
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', str(Path(output_path).parent),
            input_path,
        ])

        generated_pdf = Path(output_path).parent / f'{Path(input_path).stem}.pdf'
        if not generated_pdf.exists():
            raise RuntimeError('LibreOffice nao gerou o PDF esperado.')

        generated_pdf.replace(output_path)
        return

    if Path(input_path).suffix.lower() != '.docx':
        raise RuntimeError('Instale o LibreOffice (soffice) para converter este tipo de arquivo para PDF.')

    try:
        from docx2pdf import convert as docx2pdf_convert
    except ImportError as error:
        raise RuntimeError(
            'Instale LibreOffice (soffice) ou execute pip install -r backend/converters/requirements.txt com Word instalado.'
        ) from error

    ensure_parent_dir(output_path)
    temp_dir = str(Path(output_path).parent)
    # O docx2pdf usa o Microsoft Word no Windows e serve como fallback quando o LibreOffice nao existe.
    docx2pdf_convert(input_path, temp_dir)

    generated_pdf = Path(temp_dir) / f'{Path(input_path).stem}.pdf'
    if not generated_pdf.exists():
        raise RuntimeError('Word/docx2pdf nao gerou o PDF esperado.')

    generated_pdf.replace(output_path)


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
