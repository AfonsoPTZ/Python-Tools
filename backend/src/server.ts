// Este arquivo inicializa o servidor, prepara pastas e liga o processo principal.
import application from './app';
import logger from './config/logger';
import { cleanupExpiredFiles, ensureTempDirectoriesExist } from './services/tempFileService';
import { serverPort } from './config/environment';

async function bootstrapServer(): Promise<void> {
  // A inicializacao prepara as pastas antes de ouvir a porta, garantindo destino para uploads e saidas.
  await ensureTempDirectoriesExist();

  application.listen(serverPort, () => {
    logger.info({ port: serverPort }, 'Backend server started');
  });

  setInterval(() => {
    cleanupExpiredFiles().catch((error) => {
      logger.error({ error }, 'Failed to clean expired temporary files');
    });
  }, 15 * 60 * 1000).unref();
}

bootstrapServer().catch((error) => {
  logger.fatal({ error }, 'Failed to start backend server');
  process.exit(1);
});
