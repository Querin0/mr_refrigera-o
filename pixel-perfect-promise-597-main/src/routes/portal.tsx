import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Plus, LogOut, Star, FileText, Wrench } from "lucide-react";
import { brl, fmtDate, statusLabel, tipoLabel } from "@/lib/format";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Minha área — MR Refrigeração e Elétrica" },
      { name: "description", content: "Acompanhe seus serviços, notas fiscais e envie feedback." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: Portal,
});

function Portal() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserName((data.user?.user_metadata?.full_name as string) || data.user?.email || "");
    });
  }, []);

  const clientes = useQuery({
    queryKey: ["portal-clientes", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const clienteIds = (clientes.data ?? []).map((c) => c.id);

  const servicos = useQuery({
    queryKey: ["portal-servicos", clienteIds],
    enabled: clienteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .in("cliente_id", clienteIds)
        .order("data_servico", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const notas = useQuery({
    queryKey: ["portal-notas", clienteIds],
    enabled: clienteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas_fiscais")
        .select("*")
        .in("cliente_id", clienteIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--gradient-amber)] font-bold text-primary-foreground">MR</div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Minha área</div>
              <div className="text-xs text-muted-foreground">{userName}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={sair}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Empresas */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Minhas empresas</h2>
              <p className="text-sm text-muted-foreground">Estabelecimentos vinculados à sua conta.</p>
            </div>
            {userId && <NovaEmpresaDialog userId={userId} />}
          </div>
          {clientes.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (clientes.data?.length ?? 0) === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nenhuma empresa cadastrada ainda.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {clientes.data!.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" /> {c.nome}
                        </CardTitle>
                        {c.cnpj && <CardDescription>CNPJ {c.cnpj}</CardDescription>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    {c.telefone && <div>{c.telefone}</div>}
                    {c.endereco && <div>{c.endereco}{c.cidade ? ` — ${c.cidade}` : ""}{c.estado ? `/${c.estado}` : ""}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Serviços */}
        <section>
          <div className="mb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> Meus serviços</h2>
            <p className="text-sm text-muted-foreground">Histórico de serviços prestados às suas empresas.</p>
          </div>
          {(servicos.data?.length ?? 0) === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Nenhum serviço registrado ainda.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {servicos.data!.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <div className="font-medium">{tipoLabel[s.tipo]}{s.tipo_custom ? ` — ${s.tipo_custom}` : ""}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(s.data_servico)}</div>
                      {s.descricao && <div className="text-sm text-muted-foreground mt-1">{s.descricao}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{statusLabel[s.status]}</Badge>
                      <span className="font-semibold">{brl(Number(s.valor ?? 0))}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Notas Fiscais */}
        <section>
          <div className="mb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Minhas notas fiscais</h2>
          </div>
          {(notas.data?.length ?? 0) === 0 ? (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhuma nota fiscal disponível.</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {notas.data!.map((n) => (
                  <div key={n.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div>
                      <div className="font-medium">Nota {n.numero || "s/nº"}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(n.data_emissao)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {n.verificada && <Badge>Verificada</Badge>}
                      {n.valor != null && <span className="font-semibold">{brl(Number(n.valor))}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Feedback */}
        <section>
          <div className="mb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Deixar feedback</h2>
            <p className="text-sm text-muted-foreground">Sua opinião nos ajuda a melhorar o atendimento.</p>
          </div>
          {clientes.data && clientes.data.length > 0 ? (
            <FeedbackForm clientes={clientes.data.map((c) => ({ id: c.id, nome: c.nome }))} />
          ) : (
            <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Cadastre uma empresa para deixar feedback.</CardContent></Card>
          )}
        </section>
      </main>
    </div>
  );
}

function NovaEmpresaDialog({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", cnpj: "", telefone: "", endereco: "", cidade: "", estado: "" });

  const mut = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome da empresa.");
      const { error } = await supabase.from("clientes").insert({
        nome: form.nome,
        cnpj: form.cnpj || null,
        telefone: form.telefone || null,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        user_id: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Empresa adicionada!");
      qc.invalidateQueries({ queryKey: ["portal-clientes"] });
      setForm({ nome: "", cnpj: "", telefone: "", endereco: "", cidade: "", estado: "" });
      setOpen(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao adicionar."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova empresa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar empresa</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Loja Centro" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>CNPJ</Label><Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Cidade</Label><Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Estado</Label><Input maxLength={2} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Salvando…" : "Adicionar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackForm({ clientes }: { clientes: { id: string; nome: string }[] }) {
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  async function enviar() {
    if (!clienteId) return;
    setLoading(true);
    const { error } = await supabase.from("feedbacks").insert({ cliente_id: clienteId, nota, comentario: comentario || null });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Obrigado pelo seu feedback!");
    setComentario("");
    setNota(5);
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Empresa</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Sua nota</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setNota(n)} aria-label={`${n} estrelas`}>
                <Star className={`h-8 w-8 ${n <= nota ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Comentário (opcional)</Label>
          <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Conte como foi sua experiência…" />
        </div>
        <Button onClick={enviar} disabled={loading || !clienteId}>{loading ? "Enviando…" : "Enviar feedback"}</Button>
      </CardContent>
    </Card>
  );
}