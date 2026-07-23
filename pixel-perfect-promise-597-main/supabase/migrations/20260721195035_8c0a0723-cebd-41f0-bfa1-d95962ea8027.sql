
-- Link clientes to auth users
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);

-- Trigger: only w.jr8@hotmail.com is admin; everyone else is 'user' (cliente)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'w.jr8@hotmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure the on_auth_user_created trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: if the admin email already exists, guarantee admin role and remove stray 'user' rows for them
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'w.jr8@hotmail.com'
ON CONFLICT DO NOTHING;

-- Client (role=user) policies on clientes
DROP POLICY IF EXISTS clientes_owner_select ON public.clientes;
CREATE POLICY clientes_owner_select ON public.clientes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS clientes_owner_insert ON public.clientes;
CREATE POLICY clientes_owner_insert ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS clientes_owner_update ON public.clientes;
CREATE POLICY clientes_owner_update ON public.clientes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Client policies on servicos (read-only)
DROP POLICY IF EXISTS servicos_owner_select ON public.servicos;
CREATE POLICY servicos_owner_select ON public.servicos
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = servicos.cliente_id AND c.user_id = auth.uid()));

-- Client policies on notas_fiscais (read-only)
DROP POLICY IF EXISTS notas_owner_select ON public.notas_fiscais;
CREATE POLICY notas_owner_select ON public.notas_fiscais
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = notas_fiscais.cliente_id AND c.user_id = auth.uid()));

-- Client policies on feedbacks (read own + insert own)
DROP POLICY IF EXISTS feedbacks_owner_select ON public.feedbacks;
CREATE POLICY feedbacks_owner_select ON public.feedbacks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = feedbacks.cliente_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS feedbacks_owner_insert ON public.feedbacks;
CREATE POLICY feedbacks_owner_insert ON public.feedbacks
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.clientes c WHERE c.id = feedbacks.cliente_id AND c.user_id = auth.uid()));
