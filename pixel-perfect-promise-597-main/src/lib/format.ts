export const brl = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  const dt = new Date(d + (d.length === 10 ? "T00:00:00" : ""));
  return dt.toLocaleDateString("pt-BR");
};

export const tipoLabel: Record<string, string> = {
  manutencao: "Manutenção",
  eletrica: "Elétrica",
  refrigeracao: "Refrigeração",
  outro: "Outro",
};

export const statusLabel: Record<string, string> = {
  orcado: "Orçado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};