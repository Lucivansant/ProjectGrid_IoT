/**
 * Hook para Conectividade MQTT.
 * Fornece uma interface simples para que componentes React se conectem
 * a brokers MQTT, assinem tópicos e publiquem mensagens.
 */
import { useEffect, useState, useRef } from 'react';
import { UniversalMqttClient, MqttConnectionConfig, SensorData } from '../services/UniversalMqttClient';
// Importação relativa para o mesmo diretório services (ajuste conforme necessário)
import { MqttConnectionManager } from '../services/MqttConnectionManager';

const DEFAULT_CONFIG: MqttConnectionConfig = {
  brokerUrl: 'wss://broker.hivemq.com:8884/mqtt', 
  clientId: `project_grid_dev_${Math.random().toString(16).slice(2)}`,
};

/**
 * Hook principal para interagir com o protocolo MQTT.
 * Gerencia conexão, erros, recebimento de dados e publicação de mensagens.
 */
export function useMqtt(topic: string, userConfig?: MqttConnectionConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [data, setData] = useState<SensorData | null>(null);
  
  // Referência para o cliente (obtido do Manager)
  const clientRef = useRef<UniversalMqttClient | null>(null);

  useEffect(() => {
    // 1. Só conecta se houver uma configuração explícita
    if (!userConfig) {
      Promise.resolve().then(() => setIsConnected(false));
      return;
    }
    
    const config = userConfig;
    // Chave única para agrupar conexões iguais 
    // (Ex: Conectar 2x no mesmo broker = 1 Socket)
    const connectionKey = `${config.brokerUrl}::${config.username || 'anon'}`;
    
    // Obtém instância Compartilhada do Manager Singleton
    const manager = MqttConnectionManager.getInstance();
    const client = manager.getConnection(connectionKey.trim(), config);
    clientRef.current = client;

    // --- Listeners ---
    
    // Conexão
    const handleConnectionChange = (status: boolean) => {
      setIsConnected(status);
      if (status) {
        setConnectionError(null);
        // Assina tópico assim que conectar
        // Nota: Um pequeno delay evita race conditions em algumas versões do mqtt.js (v5)
        setTimeout(() => {
          if (clientRef.current) {
            client.subscribe(topic);
          }
        }, 100);
      }
    };

    // Erro
    const handleError = (err: Error) => {
      console.error("Erro MQTT:", err);
      // Se já estava conectado e caiu, mostra erro. Se nunca conectou, mostra erro.
      setConnectionError(err.message || "Erro de Conexão");
      setIsConnected(false);
    };

    // Mensagem (Com Filtro de Tópico Local)
    const handleMessage = (receivedTopic: string, receivedData: SensorData) => {
      // Filtragem Simples: 
      // 1. Tópico Exato
      // 2. Wildcard '#' (Pega tudo)
      // 3. Wildcard '+' (Nível único - não implementado regex complexo aqui para performance, mas 'topic' geralmente é o filtro)
      
      const isMatch = 
        topic === '#' || 
        receivedTopic === topic || 
        (topic.endsWith('/#') && receivedTopic.startsWith(topic.slice(0, -2)));

      if (isMatch) {
         setData(receivedData);
      }
    };

    // Registra listeners no cliente compartilhado
    // (O UniversalMqttClient suporta múltiplos listeners na array)
    client.onConnectionChange(handleConnectionChange);
    client.onError(handleError);
    client.onMessage(handleMessage);

    // Se já estiver conectado (por outro componente), força atualização de estado inicial manualmente
    // (pois o evento 'connect' já passou)
    // Mas o UniversalMqttClient não expõe isConnected público? Vamos assumir que sim ou checar via ref interna se puder.
    // Como não expõe, confiamos nos eventos. Se falhar, o componente fica "Conectando..." até um novo evento ou reconnect.
    // Melhoria: Adicionar getter 'isConnected' no UniversalMqttClient.

    return () => {
      // Cleanup: Remove listeners específicos deste hook
      // O UniversalMqttClient precisaria de um método 'off' para ser perfeito e não vazar memória.
      // Como não tem 'off' implementado no código anterior, os listeners acumulam. 
      // ISSO É UM PONTO DE ATENÇÃO PARA REFATORAÇÃO FUTURA DO SCRIPT CLASS.
      
      // Libera a conexão no Manager (Decrementar contador)
      manager.releaseConnection(connectionKey.trim());
      clientRef.current = null;
      
      // Reseta estado visual imediatamente
      setIsConnected(false);
      setConnectionError(null);
      setData(null);
    };
  }, [topic, userConfig]);

  /**
   * Publica uma mensagem no broker MQTT atual.
   */
  const publishMessage = (topic: string, message: object | string) => {
    if (clientRef.current) {
      clientRef.current.publish(topic, message);
    }
  };

  return { isConnected, connectionError, data, publishMessage };
}
