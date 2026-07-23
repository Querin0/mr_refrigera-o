// Substitui a antiga integração de telemetria do editor Lovable
// (window.__lovableEvents / __lovableReportRuntimeError) por um log simples.
//
// Se você quiser conectar um serviço de monitoramento (Sentry, LogRocket etc.),
// é aqui que a chamada deve entrar.
export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[App Error]", message, {
    route: window.location.pathname,
    ...context,
    stack: error instanceof Error ? error.stack : undefined,
  });
}
