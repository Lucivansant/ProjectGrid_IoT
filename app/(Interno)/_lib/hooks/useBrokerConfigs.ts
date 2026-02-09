import { useState, useCallback } from "react";

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

// Mock storage local para brokers
const getStoredBrokers = (): BrokerConfig[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('broker_configs');
  return stored ? JSON.parse(stored) : [];
};

const saveStoredBrokers = (brokers: BrokerConfig[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('broker_configs', JSON.stringify(brokers));
};

export function useBrokerConfigs() {
  const [brokers, setBrokers] = useState<BrokerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar Brokers do localStorage
  const loadBrokers = useCallback(async () => {
    setLoading(true);
    try {
      const storedBrokers = getStoredBrokers();
      setBrokers(storedBrokers);
      return storedBrokers;
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
      const currentBrokers = getStoredBrokers();
      
      const payload: BrokerConfig = {
        id: data.id || `broker_${Date.now()}`,
        name: data.name || null,
        broker_url: data.broker_url || '',
        username: data.username || null,
        password: data.password || null,
        port: Number(data.port) || 1883,
        use_ssl: Boolean(data.use_ssl),
        user_id: 'demo-user'
      };

      if (data.id) {
        // Update
        const index = currentBrokers.findIndex(b => b.id === data.id);
        if (index !== -1) {
          currentBrokers[index] = payload;
        }
      } else {
        // Insert
        currentBrokers.push(payload);
      }

      saveStoredBrokers(currentBrokers);
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
  const deleteBroker = async (id: string) => {
    try {
      const currentBrokers = getStoredBrokers();
      const filteredBrokers = currentBrokers.filter(b => b.id !== id);
      
      saveStoredBrokers(filteredBrokers);
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
