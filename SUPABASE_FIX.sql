-- Habilita a exclusão para o dono do dado na tabela broker_configs
-- Rode este comando no SQL Editor do seu projeto Supabase

CREATE POLICY "Users can delete own config"
ON public.broker_configs
FOR DELETE
USING (auth.uid() = user_id);
