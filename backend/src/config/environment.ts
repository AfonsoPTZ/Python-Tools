// Este arquivo centraliza os caminhos e portas usados pelo backend.
import path from 'node:path';

// A raiz do backend e a pasta que contem a aplicacao TypeScript e os arquivos usados em tempo de execucao.
const defaultPort = 3000;
const backendRootDirectory = path.resolve(__dirname, '..', '..');

export const frontendDirectory = path.resolve(backendRootDirectory, '..', 'frontend');
export const convertersDirectory = path.resolve(backendRootDirectory, 'converters');
export const uploadsDirectory = path.join(backendRootDirectory, 'storage', 'uploads');
export const outputsDirectory = path.join(backendRootDirectory, 'storage', 'outputs');
export const logsDirectory = path.join(backendRootDirectory, 'logs');

export const serverPort = Number.parseInt(process.env.PORT ?? `${defaultPort}`, 10);