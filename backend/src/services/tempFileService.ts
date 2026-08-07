// Este arquivo cria, limpa e remove os arquivos temporarios da API.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { outputsDirectory, uploadsDirectory } from '../config/environment';

// Os arquivos temporarios vivem pouco tempo para o backend nao acumular uploads e saidas antigas.
const maximumTempFileAgeInMilliseconds = 60 * 60 * 1000;

export async function ensureTempDirectoriesExist(): Promise<void> {
  // As duas pastas sao criadas na subida do servidor para evitar falha no primeiro upload.
  await fs.promises.mkdir(uploadsDirectory, { recursive: true });
  await fs.promises.mkdir(outputsDirectory, { recursive: true });
}

function sanitizeBaseName(originalName: string): string {
  const baseName = path.basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'file';

  return baseName;
}

export function createTempName(originalName: string, extension: string): string {
  // O upload usa um sufixo aleatorio so para evitar colisao entre arquivos temporarios simultaneos.
  return `${sanitizeBaseName(originalName)}_${Date.now()}_${crypto.randomUUID()}${extension}`;
}

export function createConvertedName(originalName: string, extension: string): string {
  // O arquivo final que o usuario baixa mantem o nome original, sem numeros aleatorios, com o sufixo "_convertido".
  return `${sanitizeBaseName(originalName)}_convertido${extension}`;
}

export function resolveOutputPath(fileName: string): string {
  return path.join(outputsDirectory, path.basename(fileName));
}

export async function cleanupExpiredFiles(): Promise<void> {
  // A limpeza remove arquivos antigos das duas pastas sem mexer nas conversoes recentes.
  const directoriesToInspect = [uploadsDirectory, outputsDirectory];
  const currentTime = Date.now();

  await Promise.all(directoriesToInspect.map(async (directoryPath) => {
    const directoryEntries = await fs.promises.readdir(directoryPath, { withFileTypes: true }).catch(() => []);

    await Promise.all(directoryEntries.filter((entry) => entry.isFile()).map(async (entry) => {
      const fullPath = path.join(directoryPath, entry.name);
      const fileStatistics = await fs.promises.stat(fullPath).catch(() => null);

      if (!fileStatistics) {
        return;
      }

      if (currentTime - fileStatistics.mtimeMs > maximumTempFileAgeInMilliseconds) {
        await fs.promises.unlink(fullPath).catch(() => null);
      }
    }));
  }));
}

export async function deleteFileIfExists(filePath: string): Promise<void> {
  await fs.promises.unlink(filePath).catch(() => null);
}