// Este arquivo junta todas as rotas da API em um unico ponto de entrada.
import { Router } from 'express';

import conversionRouter from './conversions';
import healthRouter from './healthRoutes';

const applicationRouter = Router();

// Centralizar as rotas facilita crescer a API sem mexer no bootstrap principal.
applicationRouter.use('/api', healthRouter);
applicationRouter.use('/api/conversions', conversionRouter);

export default applicationRouter;