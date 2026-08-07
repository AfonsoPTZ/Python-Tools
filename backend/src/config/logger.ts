// Este arquivo cria um logger unico para o backend, com saida no console e no arquivo app.log.
import fs from 'node:fs';
import path from 'node:path';
import pino from 'pino';

import { logsDirectory } from './environment';

// A mesma instancia de logger escreve no console e no app.log, para todo o backend compartilhar a mesma saida.
const logFilePath = path.join(logsDirectory, 'app.log');

// A pasta de logs e criada uma vez para que todas as execucoes usem o mesmo caminho de arquivo.
fs.mkdirSync(logsDirectory, { recursive: true });

const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'backend' },
    timestamp: pino.stdTimeFunctions.isoTime
  },
  pino.multistream([
    { stream: process.stdout },
    { stream: fs.createWriteStream(logFilePath, { flags: 'a' }) }
  ])
);

export { logFilePath };
export default logger;