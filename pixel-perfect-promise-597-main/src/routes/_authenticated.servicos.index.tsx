import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { brl, fmtDate, tipoLabel, statusLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/servicos/")({
  head: () => ({ meta: [{ title: "Serviços — MR" }, { name: "robots", content: "noindex" }] }),
  component: ServicosPage,
});

const TIPOS = ["manutencao", "eletrica", "refrigeracao", "outro"] as const;
const STATUSES = ["orcado", "em_andamento", "concluido", "cancelado"] as const;

function ServicosPage() {
  const qc = useQueryClient();
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    cliente_id: "", tipo: "manutencao", descricao: "",
    data_servico: new Date().toISOString().slice(0, 10),
    valor: "", forma_pagamento: "", status: "orcado",
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-min"],
    queryFn: async () => (await supabase.from("clientes").select("id, nome").order("nome")).data ?? [],
  });

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ["servicos", filterTipo, filterStatus],
    queryFn: async () => {
      let q = supabase.from("servicos").select("*, clientes(nome)").order("data_servico", { ascending: false });
      if (filterTipo !== "all") q = q.eq("tipo", filterTipo as any);
      if (filterStatus !== "all") q = q.eq("status", filterStatus as any);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = useMemo(() => servicos.reduce((s: number, x: any) => s + Number(x.valor || 0), 0), [servicos]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cliente_id) return toast.error("Selecione um cliente");
    const { error } = await supabase.from("servicos").insert({
      ...form,
      valor: Number(form.valor || 0),
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Serviço registrado");
    setOpen(false);
    setForm({ ...form, descricao: "", valor: "", forma_pagamento: "" });
    qc.invalidateQueries({ queryKey: ["servicos"] });
    qc.invalidateQueries({ queryKey: ["dashboard-kpis"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">Ordens de serviço e faturamento.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Novo serviço</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo serviço</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{tipoLabel[t]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((t) => <SelectItem key={t} value={t}>{statusLabel[t]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Data</Label><Input type="date" value={form.data_servico} onChange={(e) => setForm({ ...form, data_servico: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required /></div>
              </div>
              <div className="space-y-1.5"><Label>Forma de pagamento</Label><Input value={form.forma_pagamento} onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })} placeholder="Pix, dinheiro, cartão..." /></div>
              <div className="space-y-1.5"><Label>Descrição</Label><Textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
              <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {TIPOS.map((t) => <SelectItem key={t} value={t}>{tipoLabel[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUSES.map((t) => <SelectItem key={t} value={t}>{statusLabel[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto rounded-lg border border-border bg-card px-4 py-2 text-sm">
          <span className="text-muted-foreground">Total filtrado: </span><strong>{brl(total)}</strong>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead><TableHead>Pagamento</TableHead><TableHead className="text-right">Valor</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && servicos.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum serviço.</TableCell></TableRow>}
            {servicos.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{fmtDate(s.data_servico)}</TableCell>
                <TableCell className="font-medium">{s.clientes?.nome ?? "—"}</TableCell>
                <TableCell>{tipoLabel[s.tipo]}</TableCell>
                <TableCell><Badge variant="outline">{statusLabel[s.status]}</Badge></TableCell>
                <TableCell>{s.forma_pagamento || "—"}</TableCell>
                <TableCell className="text-right">{brl(Number(s.valor))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}