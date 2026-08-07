// Este arquivo responde a rota de health check com o status atual do servidor.
import type { Request, Response } from 'express';

import { createHealthStatus } from '../services/healthService';

export function getHealthStatus(_request: Request, response: Response): void {
  response.status(200).json(createHealthStatus());
}