import { useState, useCallback } from "react";
import { fetchBrokersPublic, saveBrokerServer, deleteBrokerServer, BrokerConfigPublic } from "../actions/brokerActions";

// Interface completa (interna para o hook, mas exportada para tipos)
export interface BrokerConfig extends BrokerConfigPublic {
  username?: string | null;
  password?: string | null;
}

export function useBrokerConfigs(initialData: BrokerConfigPublic[] = []) {
  const [brokers, setBrokers] = useState<BrokerConfigPublic[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar Brokers do banco de dados (SQLite) - Versão Protegida
  const loadBrokers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedBrokers = await fetchBrokersPublic();
      setBrokers(fetchedBrokers);
      return fetchedBrokers;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar brokers do SQLite";
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
      const success = await saveBrokerServer(data);
      if (success) {
        await loadBrokers(); // Recarrega lista
      } else {
        setError("Erro ao salvar broker no SQLite");
      }
      return success;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar broker no SQLite";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar
  const deleteBroker = async (id: string) => {
    try {
      const success = await deleteBrokerServer(id);
      if (success) {
        await loadBrokers(); // Recarrega lista oficial
      } else {
        setError("Erro ao deletar broker do SQLite");
      }
      return success;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao deletar broker no SQLite";
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
