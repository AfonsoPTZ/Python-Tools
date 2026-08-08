"""Este arquivo transcreve audio (MP3) para texto usando o Whisper, rodando 100% local."""
import sys
from pathlib import Path

import whisper

from common import ensure_parent_dir

# O modelo "base" equilibra velocidade e qualidade; modelos maiores (small, medium, large) sao mais lentos.
_MODEL_NAME = 'base'
_model = None


def _get_model():
    global _model
    if _model is None:
        # O modelo fica em memoria entre chamadas na mesma execucao do processo, mas cada conversao roda
        # em um processo Python novo (chamado pelo Node), entao ele e recarregado a cada conversao.
        _model = whisper.load_model(_MODEL_NAME)
    return _model


def convert_audio_to_text(input_path: str, output_path: str) -> None:
    ensure_parent_dir(output_path)
    model = _get_model()
    result = model.transcribe(input_path)
    Path(output_path).write_text(result['text'].strip(), encoding='utf-8')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Uso: audio_to_text.py <input_path> <output_path>')

    convert_audio_to_text(sys.argv[1], sys.argv[2])
