import { useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// Interface compartilhada
export interface BrokerConfig {
  id: string;
  name: string | null;
  broker_url: string;
  username?: string | null;
  password?: string | null;
  port: number;
  use_ssl: boolean;
  user_id: string;
}

// Cliente Supabase (pode ser extraído para um arquivo de config se preferir)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useBrokerConfigs() {
  const [brokers, setBrokers] = useState<BrokerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar Brokers do Usuário
  const loadBrokers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("broker_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setBrokers(data as BrokerConfig[]);
      return data as BrokerConfig[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar brokers";
      setError(msg);
      console.error(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar (Criar ou Atualizar)
  const saveBroker = async (data: Partial<BrokerConfig> & { id?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        name: data.name,
        broker_url: data.broker_url,
        username: data.username,
        password: data.password,
        port: Number(data.port),
        use_ssl: data.use_ssl,
        user_id: user.id
      };

      if (data.id) {
        // Update
        const { error } = await supabase
          .from("broker_configs")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("broker_configs")
          .insert([payload]);
        if (error) throw error;
      }

      await loadBrokers(); // Recarrega lista
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar broker";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar
  // Deletar
  const deleteBroker = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado para exclusão");

      console.log(`🗑️ Tentando excluir broker ${id} do usuário ${user.id}`);

      const { error } = await supabase
        .from("broker_configs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Garante segurança extra e RLS match
      
      if (error) {
        console.error("❌ Erro Supabase Delete:", error);
        throw error;
      };

      console.log("✅ Broker excluído no banco.");
      await loadBrokers(); // Recarrega lista oficial
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao deletar broker";
      setError(msg);
      console.error(msg);
      return false;
    }
  };

  return {
    brokers,
    loading,
    error,
    loadBrokers,
    saveBroker,
    deleteBroker
  };
}
