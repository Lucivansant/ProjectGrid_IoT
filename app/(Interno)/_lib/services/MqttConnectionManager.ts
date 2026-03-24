/**
 * Gerenciador de Conexões MQTT (Singleton).
 * Implementa o padrão de projeto Singleton para garantir que múltiplas partes
 * da aplicação compartilhem a mesma instância física de conexão por broker.
 */
import { UniversalMqttClient, MqttConnectionConfig } from "./UniversalMqttClient";

/**
 * Gerenciador Singleton para múltiplas conexões MQTT.
 * Garante que apenas UMA conexão seja criada por Broker, permitindo que múltiplos
 * componentes compartilhem a mesma conexão websocket.
 */
export class MqttConnectionManager {
  private static instance: MqttConnectionManager;
  
  // Mapa de Clientes Ativos: Chave = BrokerURL ou ID Único
  private clients: Map<string, UniversalMqttClient> = new Map();
  
  // Contagem de referências para saber quando desconectar
  private references: Map<string, number> = new Map();

  private constructor() {
    // Singleton Privado
  }

  /**
   * Retorna a instância única do MqttConnectionManager.
   */
  public static getInstance(): MqttConnectionManager {
    if (!MqttConnectionManager.instance) {
      MqttConnectionManager.instance = new MqttConnectionManager();
    }
    return MqttConnectionManager.instance;
  }

  /**
   * Obtém uma conexão existente ou cria uma nova se não existir.
   * @param connectionId Um ID único para agrupar conexões (ex: brokerId ou a própria URL)
   * @param config Configuração da conexão
   */
  /**
   * Obtém uma conexão existente ou cria uma nova se não existir.
   * @param connectionId Um ID único para agrupar conexões (ex: brokerId ou a própria URL)
   * @param config Configuração da conexão
   */
  public getConnection(connectionId: string, config: MqttConnectionConfig): UniversalMqttClient {
    let client = this.clients.get(connectionId);

    if (!client) {
      console.log(`[MqttManager] Criando nova conexão para: ${connectionId}`);
      client = new UniversalMqttClient(config);
      client.connect();
      this.clients.set(connectionId, client);
      this.references.set(connectionId, 0);
    } else {
      console.log(`[MqttManager] Reutilizando conexão existente: ${connectionId}`);
    }

    // Incrementa contagem de uso
    const currentRefs = this.references.get(connectionId) || 0;
    this.references.set(connectionId, currentRefs + 1);

    return client;
  }

  /**
   * Libera o uso de uma conexão. Se ninguém mais estiver usando, ela é encerrada.
   * @param connectionId ID da conexão a liberar
   */
  /**
   * Libera o uso de uma conexão. Se ninguém mais estiver usando, ela é encerrada.
   * @param connectionId ID da conexão a liberar
   */
  public releaseConnection(connectionId: string): void {
    const refs = this.references.get(connectionId);
    
    if (refs !== undefined && refs > 0) {
      const newRefs = refs - 1;
      this.references.set(connectionId, newRefs);
      console.log(`[MqttManager] Liberando conexão ${connectionId}. Refs restantes: ${newRefs}`);

      if (newRefs === 0) {
        this.disconnectAndRemove(connectionId);
      }
    }
  }

  /**
   * Força a desconexão e remove do mapa.
   */
  /**
   * Força a desconexão e remove do mapa interno de clientes.
   */
  private disconnectAndRemove(connectionId: string) {
    const client = this.clients.get(connectionId);
    if (client) {
      console.log(`[MqttManager] Fechando conexão ociosa: ${connectionId}`);
      client.disconnect();
      this.clients.delete(connectionId);
      this.references.delete(connectionId);
    }
  }
}
