// Este arquivo organiza as rotas de upload, conversao e download dos arquivos.
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';

import { uploadsDirectory } from '../config/environment';
import { createTempName } from '../services/tempFileService';
import { convert, download } from '../controllers/conversionController';

const diskStorage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    // Os arquivos enviados sao gravados na pasta de armazenamento do backend para que o script Python possa le-los depois.
    callback(null, uploadsDirectory);
  },
  filename: (_request, file, callback) => {
    callback(null, createTempName(file.originalname, path.extname(file.originalname)));
  }
});

// 1GB de limite para caber videos maiores; precisa ficar igual ao client_max_body_size do Nginx (frontend/nginx.conf).
const uploadMiddleware = multer({ storage: diskStorage, limits: { fileSize: 1024 * 1024 * 1024 } });
const conversionRouter = Router();

conversionRouter.get('/', (_request, response) => {
  // A resposta do GET funciona como uma pequena documentacao da rota sem expor detalhes internos da implementacao.
  response.json({
    message: 'Envie um arquivo via POST para esta rota.',
    methods: ['POST'],
    fields: ['file', 'conversionType'],
    conversions: ['pdf-png', 'pdf-docx', 'video-mp3', 'audio-text', 'image-png']
  });
});

conversionRouter.post('/', uploadMiddleware.single('file'), convert);
conversionRouter.get('/download/:fileName', download);

export default conversionRouter;