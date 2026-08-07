// Este arquivo monta a aplicacao Express e registra middlewares, rotas e erros.
import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import { frontendDirectory } from './config/environment';
import applicationRouter from './routes';
import { requestLogger } from './middlewares/requestLogger';

const application = express();

// O middleware principal e registrado uma unica vez para que toda requisicao passe pela mesma pipeline.
application.use(cors());
application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(requestLogger);

if (fs.existsSync(frontendDirectory)) {
  // O frontend e servido pelo mesmo processo para simplificar o ambiente local.
  application.use(express.static(frontendDirectory));
}

application.use(applicationRouter);

application.use((_request: Request, response: Response) => {
  response.status(404).json({ error: 'Route not found' });
});

application.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  response.status(500).json({
    error: error instanceof Error ? error.message : 'Unexpected server error'
  });
});

application.get('*', (_request: Request, response: Response) => {
  // Quando o frontend existe, o backend entrega a pagina inicial para a aplicacao rodar em uma unica porta.
  const frontendEntryPoint = path.join(frontendDirectory, 'index.html');

  if (fs.existsSync(frontendEntryPoint)) {
    response.sendFile(frontendEntryPoint);
    return;
  }

  response.status(404).send('Frontend not found');
});

export default application;