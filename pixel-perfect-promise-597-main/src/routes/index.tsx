import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Zap, Snowflake, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MR Refrigeração e Elétrica — Clima perfeito, energia segura" },
      { name: "description", content: "MR Refrigeração e Elétrica: manutenção, elétrica e refrigeração para residências e comércios." },
      { property: "og:title", content: "MR Refrigeração e Elétrica — Clima perfeito, energia segura" },
      { property: "og:description", content: "MR Refrigeração e Elétrica: manutenção, elétrica e refrigeração para residências e comércios." },
    ],
  }),
  component: Landing,
});

const feedbacks = [
  { nome: "João P.", texto: "Serviço rápido e impecável! Minha geladeira voltou a gelar em horas." },
  { nome: "Carlos M.", texto: "Instalação elétrica da minha loja ficou perfeita. Super recomendo a MR." },
  { nome: "Ana T.", texto: "Profissionais de confiança. Preço justo e ambiente super limpo pós-serviço." },
  { nome: "Roberto F.", texto: "O ar condicionado nunca funcionou tão bem. Parabéns pelo trabalho!" },
  { nome: "Mariana S.", texto: "Atendimento nota 1000! Salvaram o final de semana de calor intenso." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111E36] text-white">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Fundo decorativo */}
      <div className="pointer-events-none absolute inset-0">
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

      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo.png" 
              alt="Logo MR" 
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" 
            />
            {/* Texto responsivo (Oculta partes menos importantes em telas muito pequenas) */}
            <div className="flex flex-col leading-tight">
              <span className="text-xs sm:text-sm font-semibold tracking-tight md:text-base">
                MR Refrigeração <span className="hidden sm:inline">e Elétrica</span>
              </span>
              <span className="hidden sm:block text-[10px] text-white/60">Clima perfeito, energia segura</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md shrink-0">
            <Link
              to="/cadastro-cliente"
              className="rounded-full px-3 py-1.5 text-xs font-medium text-white/80 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-blue-500/20 hover:text-white hover:shadow-lg hover:shadow-blue-500/40 md:px-4 md:text-sm"
            >
              Criar conta
            </Link>
            <Link
              to="/auth"
              className="rounded-full bg-[#F2C230] px-3 py-1.5 text-xs font-bold text-[#111E36] shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#F2C230]/90 hover:shadow-lg hover:shadow-[#F2C230]/30 md:px-4 md:text-sm"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-12 sm:pt-16 md:px-6 md:pt-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F2C230]/30 bg-[#F2C230]/10 px-3 py-1 text-xs font-medium text-[#F2C230] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-[#F2C230]/30 cursor-default">
            <ShieldCheck className="h-3.5 w-3.5" /> Clima perfeito, energia segura
          </span>
          {/* Texto que se ajusta em telas menores */}
          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Energia segura.<br />
            <span className="text-[#F2C230]">Clima perfeito.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-base text-white/70 md:text-lg">
            A MR Refrigeração e Elétrica cuida da manutenção, elétrica e refrigeração da sua casa ou empresa — com
            histórico completo, notas fiscais organizadas e feedback pós-serviço.
          </p>
          
          {/* Botões Responsivos (Full width no mobile) */}
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto bg-[#F2C230] text-[#111E36] hover:bg-[#F2C230]/90 font-bold transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-[#F2C230]/30">
              <Link to="/auth">Acessar painel <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-white/20 bg-white/5 text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-blue-500/20 hover:text-white hover:shadow-lg hover:shadow-blue-500/40">
              <Link to="/cadastro-cliente">Sou cliente — criar conta</Link>
            </Button>
          </div>
        </div>

        {/* Cards Responsivos (Espaçamento fluido) */}
        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {[
            { icon: Wrench, title: "Manutenção", desc: "Ordens de serviço, valores e status em tempo real." },
            { icon: Zap, title: "Elétrica", desc: "Histórico técnico completo por estabelecimento." },
            { icon: Snowflake, title: "Refrigeração", desc: "Recorrência automática e agenda por cliente." },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-[#F2C230]/50 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-[#F2C230]/20"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F2C230]/10 ring-1 ring-[#F2C230]/30 transition-colors group-hover:bg-[#F2C230]/20">
                <f.icon className="h-5 w-5 text-[#F2C230]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção de Feedbacks Rolantes */}
      <section className="relative z-10 w-full overflow-hidden py-10 border-t border-white/10 bg-black/10 mt-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6 mb-6 flex items-center gap-2">
          <Star className="h-5 w-5 text-[#F2C230] fill-current" />
          <h2 className="text-base sm:text-lg font-semibold text-white/90 uppercase tracking-widest">O que dizem nossos clientes</h2>
        </div>
        
        <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div 
            className="flex w-max gap-4 sm:gap-6 px-4 hover:[animation-play-state:paused]"
            style={{ animation: "marquee 40s linear infinite" }}
          >
            {[...feedbacks, ...feedbacks].map((f, i) => (
              <div key={i} className="w-[280px] sm:w-80 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-md cursor-default">
                <div className="mb-3 flex text-[#F2C230]">
                  <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
                </div>
                <p className="mb-4 text-sm text-white/80 italic">"{f.texto}"</p>
                <p className="text-xs font-bold text-[#F2C230]">— {f.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-xs text-white/50">
        © {new Date().getFullYear()} MR Refrigeração e Elétrica — Clima perfeito, energia segura.
      </footer>
    </div>
  );
}
