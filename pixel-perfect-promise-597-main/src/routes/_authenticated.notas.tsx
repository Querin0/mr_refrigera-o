import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { brl, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/notas")({
  head: () => ({ meta: [{ title: "Notas Fiscais — MR" }, { name: "robots", content: "noindex" }] }),
  component: NotasPage,
});

function NotasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"todas" | "pendentes" | "verificadas">("todas");
  const [form, setForm] = useState({ cliente_id: "", servico_id: "", numero: "", valor: "", data_emissao: new Date().toISOString().slice(0, 10) });
  const [file, setFile] = useState<File | null>(null);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => (await supabase.from("clientes").select("id, nome").order("nome")).data ?? [],
  });
  const { data: notas = [], isLoading } = useQuery({
    queryKey: ["notas", filter],
    queryFn: async () => {
      let q = supabase.from("notas_fiscais").select("*, clientes(nome)").order("data_emissao", { ascending: false });
      if (filter === "pendentes") q = q.eq("verificada", false);
      if (filter === "verificadas") q = q.eq("verificada", true);
      return (await q).data ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente_id) return toast.error("Selecione o cliente");
    let arquivo_path: string | null = null;
    if (file) {
      const path = `${form.cliente_id}/${Date.now()}-${file.name}`;
      const up = await supabase.storage.from("notas-fiscais").upload(path, file);
      if (up.error) return toast.error(up.error.message);
      arquivo_path = path;
    }
    const { error } = await supabase.from("notas_fiscais").insert({
      cliente_id: form.cliente_id,
      servico_id: form.servico_id || null,
      numero: form.numero || null,
      valor: form.valor ? Number(form.valor) : null,
      data_emissao: form.data_emissao,
      arquivo_path,
    });
    if (error) return toast.error(error.message);
    toast.success("Nota fiscal registrada");
    setOpen(false); setFile(null);
    setForm({ cliente_id: "", servico_id: "", numero: "", valor: "", data_emissao: new Date().toISOString().slice(0, 10) });
    qc.invalidateQueries({ queryKey: ["notas"] });
    qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
  }

  async function toggleVerificada(id: string, atual: boolean) {
    const { error } = await supabase.from("notas_fiscais").update({ verificada: !atual }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["notas"] });
    qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
  }

  async function abrirArquivo(path: string | null) {
    if (!path) return;
    const { data } = await supabase.storage.from("notas-fiscais").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notas Fiscais</h1>
          <p className="text-sm text-muted-foreground">Repositório e conferência.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nova nota</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova nota fiscal</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Número</Label><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Valor</Label><Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Data de emissão</Label><Input type="date" value={form.data_emissao} onChange={(e) => setForm({ ...form, data_emissao: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Arquivo (PDF/imagem)</Label><Input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
              <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {(["todas", "pendentes", "verificadas"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "todas" ? "Todas" : f === "pendentes" ? "Pendentes" : "Verificadas"}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Emissão</TableHead><TableHead>Cliente</TableHead><TableHead>Número</TableHead>
            <TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && notas.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma nota.</TableCell></TableRow>}
            {notas.map((n: any) => (
              <TableRow key={n.id}>
                <TableCell>{fmtDate(n.data_emissao)}</TableCell>
                <TableCell className="font-medium">{n.clientes?.nome ?? "—"}</TableCell>
                <TableCell>{n.numero || "—"}</TableCell>
                <TableCell>{n.valor ? brl(Number(n.valor)) : "—"}</TableCell>
                <TableCell>{n.verificada ? <Badge>Verificada</Badge> : <Badge variant="outline">Pendente</Badge>}</TableCell>
                <TableCell className="text-right space-x-1">
                  {n.arquivo_path && <Button size="sm" variant="ghost" onClick={() => abrirArquivo(n.arquivo_path)}><ExternalLink className="h-4 w-4" /></Button>}
                  <Button size="sm" variant="ghost" onClick={() => toggleVerificada(n.id, n.verificada)}><Check className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}