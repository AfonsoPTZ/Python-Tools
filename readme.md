# File Converter MVP

Estrutura inicial do projeto:

- `frontend/` - HTML, CSS e JS puro
- `backend/` - API Express em TypeScript com logging Pino
- `backend/converters/` - scripts Python de conversao

Como rodar localmente:

1. Instale as dependencias da API em `backend/` com `npm install`
2. Instale as dependencias Python em `backend/converters/` com `pip install -r requirements.txt`
3. Inicie a API com `npm run dev` ou `npm start` dentro de `backend/`
4. Abra o frontend servido pela propria API

Conversoes disponiveis:

- Word (DOCX) -> PDF
- Word (DOCX) -> PNG (1 imagem por pagina, empacotadas em ZIP)
- PDF -> PNG (1 imagem por pagina, empacotadas em ZIP)
- PDF -> Word (DOCX)
- Excel (XLSX) -> PDF
- PowerPoint (PPTX) -> PDF
- Video -> MP3
- Imagem -> PNG

Dependencias externas esperadas para as conversoes:

- LibreOffice / `soffice` para DOCX, XLSX e PPTX -> PDF (com fallback para o Word via `docx2pdf` apenas em DOCX no Windows)
- FFmpeg para video -> MP3