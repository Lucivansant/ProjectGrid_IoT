import { createClient } from '@supabase/supabase-js';
import { AuthStorage } from './AuthStorage';

// Inicializa o cliente Supabase
// Certifique-se de ter as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const Auth = {
  // Captura os dados do localStorage e registra/loga no Supabase
  syncWithSupabase: async () => {
    try {
      const token = AuthStorage.get();
      
      if (!token) {
        console.warn('Nenhum token encontrado no armazenamento local.');
        return null;
      }

      // Faz login no Supabase usando o ID Token do Google
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: token,
      });

      if (error) {
        console.error('Erro ao autenticar no Supabase:', error.message);
        throw error;
      }


      // Limpa o token temporário após o sucesso
      AuthStorage.clear();

      return data;
      
    } catch (error) {
      console.error('Falha no processo de sincronização de autheticação:', error);
      throw error;
    }
  }
};
