import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Copy } from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/feedbacks")({
  head: () => ({ meta: [{ title: "Feedbacks — MR" }, { name: "robots", content: "noindex" }] }),
  component: FeedbacksPage,
});

function FeedbacksPage() {
  const [clienteId, setClienteId] = useState("");

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => (await supabase.from("feedbacks").select("*, clientes(nome)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => (await supabase.from("clientes").select("id, nome").order("nome")).data ?? [],
  });

  const media = feedbacks.length ? feedbacks.reduce((s: number, f: any) => s + f.nota, 0) / feedbacks.length : 0;

  function copiarLink(id: string) {
    const url = `${window.location.origin}/feedback/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feedbacks</h1>
        <p className="text-sm text-muted-foreground">Avaliações recebidas dos clientes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold">{feedbacks.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Nota média</CardTitle></CardHeader>
          <CardContent><div className="flex items-baseline gap-2"><span className="text-3xl font-semibold">{media.toFixed(1)}</span><span className="text-muted-foreground text-sm">/ 5</span></div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Gerar link de avaliação</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Selecione um cliente...</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {clienteId && (
              <div className="flex gap-2">
                <Input readOnly value={`${window.location.origin}/feedback/${clienteId}`} />
                <Button size="icon" variant="outline" onClick={() => copiarLink(clienteId)}><Copy className="h-4 w-4" /></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {feedbacks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum feedback ainda.</p>}
        {feedbacks.map((f: any) => (
          <Card key={f.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{f.clientes?.nome ?? "Cliente"}</div>
                <span className="text-xs text-muted-foreground">{fmtDate(f.created_at)}</span>
              </div>
              <div className="mt-1 flex items-center gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < f.nota ? "fill-primary" : "opacity-30"}`} />
                ))}
              </div>
              {f.comentario && <p className="mt-2 text-sm text-muted-foreground">{f.comentario}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}