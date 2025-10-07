ALTER TABLE public.offers
ADD COLUMN upsell_4_link TEXT,
ADD COLUMN upsell_5_link TEXT,
ADD COLUMN upsell_6_link TEXT,
ADD COLUMN upsell_7_link TEXT;

-- As políticas RLS existentes para a tabela 'offers' (que são públicas) já cobrirão estas novas colunas.
-- Não é necessário adicionar novas políticas específicas.