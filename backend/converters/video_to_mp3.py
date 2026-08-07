"""Este arquivo extrai o audio de videos e salva em MP3."""
import sys

from common import ensure_parent_dir, find_executable, run_command


def convert_video_to_mp3(input_path: str, output_path: str) -> None:
    # O FFmpeg extrai apenas a faixa de audio, deixando a saida pequena e previsivel.
    ensure_parent_dir(output_path)
    ffmpeg = find_executable('ffmpeg')
    run_command([
        ffmpeg,
        '-y',
        '-i', input_path,
        '-vn',
        '-acodec', 'libmp3lame',
        '-q:a', '2',
        output_path,
    ])


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Uso: video_to_mp3.py <input_path> <output_path>')

    convert_video_to_mp3(sys.argv[1], sys.argv[2])