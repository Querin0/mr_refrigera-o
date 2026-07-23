-- 1) O bucket "notas-fiscais" nunca foi criado, apenas suas policies em
--    storage.objects. Sem isso, todo upload de nota fiscal falha.
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-fiscais', 'notas-fiscais', false)
ON CONFLICT (id) DO NOTHING;

-- 2) A coluna user_roles.role tinha DEFAULT 'admin' (resquício do scaffold
--    inicial, quando qualquer cadastro virava admin). Torna o default seguro:
--    qualquer inserção futura sem role explícita vira 'user', nunca 'admin'.
ALTER TABLE public.user_roles ALTER COLUMN role SET DEFAULT 'user';

-- 3) Correção de segurança: a migration anterior passou a admitir apenas
--    w.jr8@hotmail.com como admin, mas não revogou o papel 'admin' de quem
--    já havia se cadastrado antes dessa regra existir (quando o trigger
--    antigo promovia todo mundo a admin). Remove esse acesso indevido.
DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id
  AND ur.role = 'admin'
  AND lower(u.email) <> 'w.jr8@hotmail.com';

-- Garante que todo usuário sem nenhuma linha em user_roles fique como
-- 'user' (cliente), nunca sem papel algum.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::app_role
FROM auth.users u
WHERE lower(u.email) <> 'w.jr8@hotmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
  )
ON CONFLICT DO NOTHING;
