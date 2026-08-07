// Este arquivo registra automaticamente todas as requisicoes HTTP com o Pino.
import pinoHttp from 'pino-http';

import logger from '../config/logger';

// Cada requisicao gera uma unica linha de log ao terminar, apenas com o essencial (metodo, rota, status e tempo).
export const requestLogger = pinoHttp({
  logger,
  serializers: {
    req: (request) => ({ method: request.method, url: request.url }),
    res: (response) => ({ statusCode: response.statusCode })
  },
  customSuccessMessage: (request, response) => `${request.method} ${request.url} -> ${response.statusCode}`,
  customErrorMessage: (request, response, error: Error) =>
    `${request.method} ${request.url} -> ${response?.statusCode ?? 500} (${error.message})`
});