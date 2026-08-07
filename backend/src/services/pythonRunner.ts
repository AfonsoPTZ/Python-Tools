// Este arquivo executa scripts Python como processos filhos e captura a saida deles.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

// O ambiente virtual local tem prioridade para evitar depender do alias do Windows Store.
const projectPythonExecutable = path.resolve(__dirname, '..', '..', '..', '.venv', 'Scripts', 'python.exe');

export function getPythonCommand(): string {
  if (process.env.PYTHON_BIN) {
    return process.env.PYTHON_BIN;
  }

  if (process.env.PYTHON) {
    return process.env.PYTHON;
  }

  if (fs.existsSync(projectPythonExecutable)) {
    return projectPythonExecutable;
  }

  return 'python';
}

export function runPythonScript(scriptPath: string, argumentsList: string[] = []): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    // A saida do processo filho e coletada para que erros do Python voltem como uma unica mensagem clara.
    const childProcess = spawn(getPythonCommand(), [scriptPath, ...argumentsList], { windowsHide: true });
    let standardOutput = '';
    let standardError = '';

    childProcess.stdout.on('data', (chunk: Buffer) => {
      standardOutput += chunk.toString();
    });

    childProcess.stderr.on('data', (chunk: Buffer) => {
      standardError += chunk.toString();
    });

    childProcess.on('error', (error) => {
      reject(new Error(`Falha ao iniciar o Python: ${error.message}`));
    });

    childProcess.on('close', (exitCode) => {
      if (exitCode !== 0) {
        reject(new Error(standardError.trim() || standardOutput.trim() || `Python retornou codigo ${exitCode}`));
        return;
      }

      resolve({ stdout: standardOutput, stderr: standardError });
    });
  });
}