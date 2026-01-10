import { createClient } from '@supabase/supabase-js';

// Acessando as variáveis de ambiente que definimos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validando se as chaves existem (ajuda a debugar se esquecer o .env)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase!');
}

// Exportando a conexão pronta para uso
export const supabase = createClient(supabaseUrl, supabaseAnonKey);