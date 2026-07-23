import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { brl, fmtDate, tipoLabel, statusLabel } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clientes/$id")({
  head: () => ({ meta: [{ title: "Cliente — MR" }, { name: "robots", content: "noindex" }] }),
  component: ClienteDetail,
});

function ClienteDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: cliente } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => (await supabase.from("clientes").select("*").eq("id", id).maybeSingle()).data,
  });
  const { data: servicos = [] } = useQuery({
    queryKey: ["cliente-servicos", id],
    queryFn: async () => (await supabase.from("servicos").select("*").eq("cliente_id", id).order("data_servico", { ascending: false })).data ?? [],
  });
  const { data: feedbacks = [] } = useQuery({
    queryKey: ["cliente-feedbacks", id],
    queryFn: async () => (await supabase.from("feedbacks").select("*").eq("cliente_id", id).order("created_at", { ascending: false })).data ?? [],
  });

  const total = servicos.reduce((s: number, x: any) => s + Number(x.valor || 0), 0);
  const recorrencia = calcRecorrencia(servicos.map((s: any) => s.data_servico));

  async function remover() {
    if (!confirm("Excluir este cliente e todos os serviços vinculados?")) return;
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cliente removido");
    qc.invalidateQueries({ queryKey: ["clientes"] });
    navigate({ to: "/clientes" });
  }

  if (!cliente) return <div className="text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm"><Link to="/clientes"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link></Button>
        <Button variant="outline" size="sm" onClick={remover}><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>{cliente.nome}</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <Info label="CNPJ" v={cliente.cnpj} />
            <Info label="Telefone" v={cliente.telefone} />
            <Info label="E-mail" v={cliente.email} />
            <Info label="Cidade / UF" v={[cliente.cidade, cliente.estado].filter(Boolean).join(" / ")} />
            <Info label="Endereço" v={cliente.endereco} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Serviços</span><strong>{servicos.length}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total gasto</span><strong>{brl(total)}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Recorrência</span><Badge variant="secondary">{recorrencia}</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Histórico de serviços</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
            <TableBody>
              {servicos.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Nenhum serviço.</TableCell></TableRow>}
              {servicos.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{fmtDate(s.data_servico)}</TableCell>
                  <TableCell>{tipoLabel[s.tipo] ?? s.tipo}</TableCell>
                  <TableCell className="max-w-[280px] truncate">{s.descricao || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{statusLabel[s.status]}</Badge></TableCell>
                  <TableCell className="text-right">{brl(Number(s.valor))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Feedbacks</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {feedbacks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum feedback registrado.</p>}
          {feedbacks.map((f: any) => (
            <div key={f.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < f.nota ? "fill-primary" : "opacity-30"}`} />
                ))}
                <span className="ml-2 text-xs text-muted-foreground">{fmtDate(f.created_at)}</span>
              </div>
              {f.comentario && <p className="mt-2 text-sm">{f.comentario}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, v }: { label: string; v?: string | null }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div>{v || "—"}</div></div>;
}

function calcRecorrencia(dates: string[]) {
  if (dates.length < 2) return "Esporádico";
  const sorted = dates.map((d) => new Date(d).getTime()).sort((a, b) => a - b);
  const gaps = sorted.slice(1).map((t, i) => (t - sorted[i]) / (1000 * 60 * 60 * 24));
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  if (avg <= 45) return "Mensal";
  if (avg <= 120) return "Trimestral";
  if (avg <= 210) return "Semestral";
  return "Esporádico";
}