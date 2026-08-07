// Este arquivo expõe a rota de health da API.
import { Router } from 'express';

import { getHealthStatus } from '../controllers/healthController';

const healthRouter = Router();

healthRouter.get('/health', getHealthStatus);

export default healthRouter;