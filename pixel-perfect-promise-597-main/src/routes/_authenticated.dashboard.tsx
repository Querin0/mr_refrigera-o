import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { Users, Wrench, DollarSign, FileText, Star } from "lucide-react";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MR" },
      { name: "description", content: "Visão geral dos serviços, faturamento e clientes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

      const [servMes, clientes, notasPend, feedbacks] = await Promise.all([
        supabase.from("servicos").select("valor, status").gte("data_servico", start).lt("data_servico", end),
        supabase.from("clientes").select("id", { count: "exact", head: true }),
        supabase.from("notas_fiscais").select("id", { count: "exact", head: true }).eq("verificada", false),
        supabase.from("feedbacks").select("nota"),
      ]);

      const servicos = servMes.data ?? [];
      const faturamento = servicos
        .filter((s: any) => s.status === "concluido")
        .reduce((sum: number, s: any) => sum + Number(s.valor || 0), 0);
      const totalNotas = feedbacks.data?.length ?? 0;
      const media = totalNotas
        ? (feedbacks.data!.reduce((s: number, f: any) => s + f.nota, 0) / totalNotas)
        : 0;

      return {
        servicosMes: servicos.length,
        faturamento,
        clientesAtivos: clientes.count ?? 0,
        notasPendentes: notasPend.count ?? 0,
        satisfacao: media,
      };
    },
  });

  const cards = [
    { title: "Serviços no mês", value: data?.servicosMes ?? "—", icon: Wrench },
    { title: "Faturamento do mês", value: brl(data?.faturamento ?? 0), icon: DollarSign },
    { title: "Clientes ativos", value: data?.clientesAtivos ?? "—", icon: Users },
    { title: "Notas pendentes", value: data?.notasPendentes ?? "—", icon: FileText },
    { title: "Satisfação média", value: data?.satisfacao ? data.satisfacao.toFixed(1) + " / 5" : "—", icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do mês corrente.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <MetricCard key={c.title} title={c.title} value={c.value} icon={c.icon} loading={isLoading} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comece por aqui</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Cadastre seus <strong>clientes</strong> ou compartilhe o link público <code className="rounded bg-muted px-1">/cadastro-cliente</code>.</p>
          <p>• Registre <strong>serviços</strong> prestados com valor, status e forma de pagamento.</p>
          <p>• Envie <strong>notas fiscais</strong> vinculadas a cada serviço.</p>
          <p>• Colete <strong>feedbacks</strong> — o link público <code className="rounded bg-muted px-1">/feedback/&lt;id-cliente&gt;</code> pode ser enviado após cada atendimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}