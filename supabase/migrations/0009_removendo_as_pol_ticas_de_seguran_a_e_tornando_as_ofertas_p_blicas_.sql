-- Torna a coluna user_id opcional, já que não haverá mais login
ALTER TABLE public.offers
ALTER COLUMN user_id DROP NOT NULL;

-- Desabilita a Segurança a Nível de Linha para tornar os dados públicos
ALTER TABLE public.offers
DISABLE ROW LEVEL SECURITY;

-- Remove as políticas de segurança antigas que dependiam de um usuário logado
DROP POLICY IF EXISTS "Users can only delete their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can only update their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can only insert their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can only see their own offers" ON public.offers;