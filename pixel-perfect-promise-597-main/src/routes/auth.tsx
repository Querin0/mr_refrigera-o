import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, LogIn, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) throw error;
      
      toast.success("Login realizado com sucesso!");
      router.invalidate();
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111E36] text-white flex flex-col items-center justify-center p-6">
      
      {/* Fundo decorativo idêntico ao da Homepage */}
      <div className="pointer-events-none absolute inset-0 z-0">
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

      {/* Botão Voltar */}
      <div className="absolute top-8 left-8 z-20">
         <Link to="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2">
           <ArrowLeft className="w-4 h-4" /> Voltar
         </Link>
      </div>

      {/* Container Centralizado Único (Resolve a Dualidade) */}
      <div className="relative z-10 w-full max-w-md space-y-8 mt-10">
        
        {/* Logo Centralizada */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <img src="/logo.png" alt="Logo MR" className="h-28 sm:h-36 w-auto object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" />
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">MR Refrigeração e Elétrica</h1>
            <p className="text-sm sm:text-base text-white/70 font-light mt-2">
              Clima perfeito, energia segura.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <Card className="w-full shadow-2xl border-white/10 bg-white/5 backdrop-blur-md rounded-2xl">
          <CardHeader className="space-y-2 pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-white">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center text-white/60 text-sm">
              Gerencie seus serviços e clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="pl-10 h-12 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-[#F2C230]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha" className="text-white/90 font-medium">Senha</Label>
                  <a href="#" className="text-sm font-medium text-[#F2C230] hover:underline">Esqueceu a senha?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                  <Input 
                    id="senha" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-[#F2C230]"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 mt-4 text-base font-bold bg-[#F2C230] text-[#111E36] hover:bg-[#F2C230]/90 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-[#F2C230]/30 rounded-xl"
              >
                {loading ? "Autenticando..." : (
                  <>
                    Entrar <LogIn className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-white/60">
              Não tem uma conta?{" "}
              <Link to="/cadastro-cliente" className="font-semibold text-[#F2C230] hover:underline transition-all">
                Criar conta agora
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
