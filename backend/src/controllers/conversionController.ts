// Este arquivo valida a requisicao de conversao e delega o trabalho para os servicos.
import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';

import type { ConversionType } from '../services/conversionService';
import { convertFile, getOutputFilePath } from '../services/conversionService';
import { deleteFileIfExists } from '../services/tempFileService';
import logger from '../config/logger';

interface ConversionRequestBody {
  conversionType?: ConversionType;
}

interface ConversionRequest extends Request<Record<string, never>, Record<string, unknown>, ConversionRequestBody> {
  file?: Express.Multer.File;
}

export async function convert(request: ConversionRequest, response: Response, next: NextFunction): Promise<Response | void> {
  try {
    // O controller apenas valida a requisicao e repassa o trabalho pesado para a camada de servico.
    if (!request.file) {
      return response.status(400).json({ error: 'Envie um arquivo para conversao.' });
    }

    const conversionType = request.body.conversionType;

    if (!conversionType) {
      return response.status(400).json({ error: 'Informe o tipo de conversao.' });
    }

    const result = await convertFile(request.file, conversionType);

    // Um log enxuto por conversao concluida: so o essencial para auditoria (hora e tipo ja vem no proprio log do Pino).
    logger.info({ conversionType, fileName: result.outputFileName }, 'Conversao concluida');

    return response.json({
      message: 'Arquivo convertido com sucesso.',
      downloadUrl: `/api/conversions/download/${encodeURIComponent(result.outputFileName)}`,
      fileName: result.outputFileName,
      mimeType: result.mimeType
    });
  } catch (error) {
    return next(error);
  }
}

export async function download(request: Request<{ fileName: string }>, response: Response, next: NextFunction): Promise<void> {
  try {
    // O arquivo gerado e enviado ao cliente e removido depois que o download termina com sucesso.
    const safeFileName = path.basename(request.params.fileName);
    const filePath = await getOutputFilePath(safeFileName);

    response.download(filePath, safeFileName, async (downloadError) => {
      if (downloadError) {
        next(downloadError);
        return;
      }

      await deleteFileIfExists(filePath);
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      response.status(404).json({ error: 'Arquivo nao encontrado.' });
      return;
    }

    next(error);
  }
}