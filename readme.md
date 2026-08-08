# File Converter MVP

Estrutura inicial do projeto:

- `frontend/` - HTML, CSS e JS puro
- `backend/` - API Express em TypeScript com logging Pino
- `backend/converters/` - scripts Python de conversao

Como rodar localmente:

1. Instale as dependencias da API em `backend/` com `npm install`
2. Instale o Torch na versao CPU (mais leve) antes do resto: `pip install torch --index-url https://download.pytorch.org/whl/cpu`
3. Instale as dependencias Python em `backend/converters/` com `pip install -r requirements.txt`
4. Inicie a API com `npm run dev` ou `npm start` dentro de `backend/`
5. Abra o frontend servido pela propria API

Conversoes disponiveis (todas usando apenas bibliotecas Python + FFmpeg, sem LibreOffice):

- PDF -> PNG (1 imagem por pagina, empacotadas em ZIP)
- PDF -> Word (DOCX)
- Video -> MP3
- Audio (MP3) -> texto (transcricao local com Whisper)
- Imagem -> PNG

Dependencias externas esperadas para as conversoes:

- FFmpeg para video -> MP3 e para o Whisper decodificar o audio na conversao de texto
- Na primeira transcricao de audio, o Whisper baixa o modelo (~150MB) e guarda em cache; no Docker esse
  download ja acontece durante o build da imagem, entao roda offline em producao.