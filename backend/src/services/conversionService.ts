// Este arquivo decide qual script Python usar para cada tipo de conversao.
import fs from 'node:fs';
import path from 'node:path';

import { convertersDirectory } from '../config/environment';
import { createConvertedName, deleteFileIfExists, resolveOutputPath } from './tempFileService';
import { runPythonScript } from './pythonRunner';

export type ConversionType =
  | 'docx-pdf'
  | 'docx-png'
  | 'pdf-png'
  | 'pdf-docx'
  | 'xlsx-pdf'
  | 'pptx-pdf'
  | 'video-mp3'
  | 'image-png';

interface ConversionDetails {
  scriptName: string;
  outputExtension: string;
  mimeType: string;
}

interface UploadedFileReference {
  originalname: string;
  path: string;
}

export interface ConversionResult {
  outputFileName: string;
  outputPath: string;
  mimeType: string;
}

const conversionDetailsByType: Record<ConversionType, ConversionDetails> = {
  'docx-pdf': {
    scriptName: 'docx_to_pdf.py',
    outputExtension: '.pdf',
    mimeType: 'application/pdf'
  },
  'docx-png': {
    // Cada pagina do DOCX vira um PNG separado, entao a saida e um ZIP com uma imagem por pagina.
    scriptName: 'docx_to_png.py',
    outputExtension: '.zip',
    mimeType: 'application/zip'
  },
  'pdf-png': {
    // Mesma logica do DOCX: um PNG por pagina do PDF, empacotados em um ZIP.
    scriptName: 'pdf_to_png.py',
    outputExtension: '.zip',
    mimeType: 'application/zip'
  },
  'pdf-docx': {
    scriptName: 'pdf_to_docx.py',
    outputExtension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  'xlsx-pdf': {
    scriptName: 'xlsx_to_pdf.py',
    outputExtension: '.pdf',
    mimeType: 'application/pdf'
  },
  'pptx-pdf': {
    scriptName: 'pptx_to_pdf.py',
    outputExtension: '.pdf',
    mimeType: 'application/pdf'
  },
  'video-mp3': {
    scriptName: 'video_to_mp3.py',
    outputExtension: '.mp3',
    mimeType: 'audio/mpeg'
  },
  'image-png': {
    scriptName: 'image_to_png.py',
    outputExtension: '.png',
    mimeType: 'image/png'
  }
};

export async function convertFile(fileReference: UploadedFileReference, conversionType: ConversionType): Promise<ConversionResult> {
  // Cada tipo de conversao aponta para um script Python reutilizavel, deixando o backend mais fino e facil de trocar depois.
  const conversionDetails = conversionDetailsByType[conversionType];

  if (!conversionDetails) {
    throw new Error('Tipo de conversao invalido.');
  }

  const scriptPath = path.join(convertersDirectory, conversionDetails.scriptName);

  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script Python nao encontrado: ${conversionDetails.scriptName}`);
  }

  const outputFileName = createConvertedName(fileReference.originalname, conversionDetails.outputExtension);
  const outputPath = resolveOutputPath(outputFileName);

  try {
    // O script Python recebe o arquivo de entrada e o caminho de saida, gravando o resultado convertido em disco.
    await runPythonScript(scriptPath, [fileReference.path, outputPath]);
    await deleteFileIfExists(fileReference.path);
  } catch (error) {
    await deleteFileIfExists(outputPath);
    throw new Error(`Falha na conversao: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }

  return {
    outputFileName,
    outputPath,
    mimeType: conversionDetails.mimeType
  };
}

export async function getOutputFilePath(fileName: string): Promise<string> {
  const filePath = resolveOutputPath(fileName);
  await fs.promises.access(filePath);
  return filePath;
}