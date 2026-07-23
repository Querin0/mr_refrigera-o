import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, ArrowLeft, User, Building2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/cadastro-cliente")({
  head: () => ({
    meta: [
      { title: "Criar conta — MR" },
      { name: "description", content: "Crie sua conta na MR em 3 passos simples para acompanhar seus serviços." },
    ],
  }),
  component: CadastroWizard,
});

type Etapa = 1 | 2 | 3 | 4;

function CadastroWizard() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [loading, setLoading] = useState(false);

  // Passo 1 — seus dados
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");

  // Passo 2 — empresa
  const [empresa, setEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const progresso = etapa === 4 ? 100 : (etapa / 3) * 100;

  function proximo() {
    if (etapa === 1) {
      if (!nome.trim() || !email.trim() || senha.length < 6) {
        toast.error("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
        return;
      }
    }
    if (etapa === 2) {
      if (!empresa.trim()) {
        toast.error("Informe o nome da sua empresa ou estabelecimento.");
        return;
      }
    }
    setEtapa((e) => (e + 1) as Etapa);
  }

  async function finalizar() {
    setLoading(true);
    try {
      const { data: signup, error: e1 } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
          data: { full_name: nome },
        },
      });
      if (e1) throw e1;

      let userId = signup.user?.id;
      if (!signup.session) {
        const { data: signin, error: e2 } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (e2) throw e2;
        userId = signin.user?.id;
      }

      if (!userId) throw new Error("Não foi possível recuperar sua conta.");

      const { error: e3 } = await supabase.from("clientes").insert({
        nome: empresa,
        cnpj: cnpj || null,
        telefone: telefone || null,
        email,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        user_id: userId,
      });

      if (e3) throw e3;

      setEtapa(4);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111E36] text-white py-10 px-4">
      
      {/* Fundo decorativo idêntico ao da Homepage */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#F2C230]/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[#F2C230]/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors">← Voltar</Link>
          <Link to="/auth" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Já tenho conta</Link>
        </div>

        {/* Barra de progresso */}
        {etapa < 4 && (
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs font-medium text-white/60">
              <span className={etapa >= 1 ? "text-white" : ""}>1. Seus dados</span>
              <span className={etapa >= 2 ? "text-white" : ""}>2. Sua empresa</span>
              <span className={etapa >= 3 ? "text-white" : ""}>3. Confirmação</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}

        <Card className="shadow-2xl border-white/10 backdrop-blur-md relative overflow-hidden">
          {etapa === 1 && (
            <>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Bem-vindo(a) à MR</span>
                </div>
                <CardTitle className="text-2xl">Vamos criar sua conta</CardTitle>
                <CardDescription className="text-white/60">
                  Na MR você vai <strong>acompanhar seus serviços</strong>, <strong>ver suas notas fiscais</strong> e{" "}
                  <strong>deixar seu feedback</strong>. É rapidinho — 3 passos simples.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4 text-primary" /> Passo 1 — Seus dados pessoais
                  </div>
                  <p className="mt-1 text-white/60">Vamos usar isso para você entrar na sua área.</p>
                </div>

                <Campo label="Seu nome completo" hint="Como devemos te chamar. Ex: Maria Silva">
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Maria Silva" />
                </Campo>

                <Campo label="E-mail" hint="Você vai usar esse e-mail para entrar. Ex: maria@empresa.com">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
                </Campo>

                <Campo label="Crie uma senha" hint="Use pelo menos 6 caracteres. Guarde num lugar seguro.">
                  <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
                </Campo>

                <Campo label="Telefone (opcional)" hint="Para contato mais rápido, se precisar.">
                  <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 90000-0000" />
                </Campo>

                <Button onClick={proximo} className="w-full mt-2 font-bold text-[#111E36]">
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {etapa === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Conte sobre sua empresa</CardTitle>
                <CardDescription className="text-white/60">
                  Estes são os dados do estabelecimento onde faremos os serviços. Se você cuidar de mais de um lugar,
                  não se preocupe — depois dá para adicionar outros.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <Building2 className="h-4 w-4 text-primary" /> Passo 2 — Dados da empresa
                  </div>
                </div>

                <Campo label="Nome da empresa ou estabelecimento" hint="Ex: Padaria do João, Restaurante Sabor & Cia">
                  <Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Ex: Padaria do João" />
                </Campo>

                <Campo label="CNPJ (opcional)" hint="Somente números. Ex: 12345678000199">
                  <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                </Campo>

                <Campo label="Endereço" hint="Rua, número, bairro. Ex: Rua das Flores, 123 — Centro">
                  <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua das Flores, 123 — Centro" />
                </Campo>

                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Cidade" hint="Ex: São Paulo">
                    <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo" />
                  </Campo>
                  <Campo label="Estado" hint="Sigla, ex: SP">
                    <Input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="SP" maxLength={2} />
                  </Campo>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEtapa(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button onClick={proximo} className="flex-1 font-bold text-[#111E36]">
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {etapa === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Confira suas informações</CardTitle>
                <CardDescription className="text-white/60">
                  Está tudo certinho? Se sim, clique em <strong>Criar minha conta</strong>. Se algo estiver errado,
                  você pode voltar e ajustar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Resumo titulo="Seus dados">
                  <Item label="Nome" valor={nome} />
                  <Item label="E-mail" valor={email} />
                  {telefone && <Item label="Telefone" valor={telefone} />}
                </Resumo>

                <Resumo titulo="Sua empresa">
                  <Item label="Nome" valor={empresa} />
                  {cnpj && <Item label="CNPJ" valor={cnpj} />}
                  {endereco && <Item label="Endereço" valor={endereco} />}
                  {(cidade || estado) && <Item label="Cidade / Estado" valor={`${cidade}${cidade && estado ? " — " : ""}${estado}`} />}
                </Resumo>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEtapa(2)} className="flex-1" disabled={loading}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button onClick={finalizar} className="flex-1 font-bold text-[#111E36]" disabled={loading}>
                    {loading ? "Criando..." : "Criar minha conta"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {etapa === 4 && (
            <CardContent className="py-12 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/20 ring-1 ring-primary/50">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mt-6 text-2xl font-bold">Conta criada com sucesso! 🎉</h2>
              <p className="mt-3 text-white/70">
                Prontinho, {nome.split(" ")[0]}! Sua área já está esperando por você.
              </p>
              <Button onClick={() => navigate({ to: "/portal" })} size="lg" className="mt-6 font-bold text-[#111E36]">
                Entrar na minha área <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

function Campo({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-white/50">{hint}</p>}
    </div>
  );
}

function Resumo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-bold text-primary uppercase tracking-wider">{titulo}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Item({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/60">{label}</span>
      <span className="font-medium text-right">{valor}</span>
    </div>
  );
}
