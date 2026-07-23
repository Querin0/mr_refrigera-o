import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/feedback/$clienteId")({
  head: () => ({
    meta: [
      { title: "Avalie nosso serviço — MR" },
      { name: "description", content: "Deixe sua avaliação sobre o serviço prestado." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FeedbackPublico,
});

function FeedbackPublico() {
  const { clienteId } = Route.useParams();
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: cliente } = useQuery({
    queryKey: ["cliente-public", clienteId],
    queryFn: async () => (await supabase.from("clientes").select("nome").eq("id", clienteId).maybeSingle()).data,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nota) return toast.error("Escolha uma nota");
    setLoading(true);
    const { error } = await supabase.from("feedbacks").insert({ cliente_id: clienteId, nota, comentario: comentario || null });
    setLoading(false);
    if (error) return toast.error(error.message);
    setEnviado(true);
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Como foi nosso atendimento?</CardTitle>
            {cliente && <p className="text-sm text-muted-foreground">Olá, {cliente.nome}!</p>}
          </CardHeader>
          <CardContent>
            {enviado ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                <h2 className="mt-4 text-xl font-semibold">Obrigado!</h2>
                <p className="mt-2 text-muted-foreground">Seu feedback foi enviado.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setNota(n)} className="p-1">
                      <Star className={`h-10 w-10 transition ${n <= (hover || nota) ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>
                <Textarea rows={4} placeholder="Comentários (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Enviando..." : "Enviar avaliação"}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}