ALTER TABLE public.offers
ADD COLUMN ad_library_link TEXT;

-- Adicionando políticas RLS para a nova coluna (se necessário, as políticas existentes já devem cobrir UPDATE)
-- Se as políticas existentes já usam 'USING (true)' ou 'USING (auth.uid() = user_id)',
-- elas já cobrirão a nova coluna. Caso contrário, seria necessário ajustá-las.
-- Como as políticas atuais para 'offers' são públicas (true), não é necessário adicionar novas políticas específicas para esta coluna.