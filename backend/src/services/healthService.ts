// Este arquivo monta a resposta simples da rota de status da API.
export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}

export function createHealthStatus(): HealthStatus {
  // Um servico dedicado mantem a rota enxuta e preserva a estrutura em camadas.
  return {
    status: 'ok',
    uptimeSeconds: Number(process.uptime().toFixed(0))
  };
}