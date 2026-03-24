/**
 * Configuração do Banco de Dados Local (IndexedDB).
 * Utiliza o Dexie.js para gerenciar persistência de mensagens MQTT
 * e configurações de dispositivos diretamente no navegador do usuário.
 */
import Dexie, { Table } from 'dexie';

export interface MqttMessageRecord {
  id?: number; // Auto-incremento
  topic: string;
  payload: string | object;
  brokerId: string;
  timestamp: number;
}

export interface DeviceConfig {
  topic: string;
  limits: Record<string, { max?: number; min?: number; exactMatch?: string }>;
  alias?: string; // Nome amigável opcional
}

class ProjectGridDB extends Dexie {
  messages!: Table<MqttMessageRecord>;
  device_configs!: Table<DeviceConfig>;

  /**
   * Construtor da classe ProjectGridDB.
   * Define as versões e esquemas de tabelas para persistência local.
   */
  constructor() {
    super('ProjectGridDB');
    
    // Versão 1 do Schema
    this.version(1).stores({
      messages: '++id, topic, brokerId, timestamp, [brokerId+topic]' // Índices para busca rápida
    });

    // Versão 2: Configurações e Alarmes
    this.version(2).stores({
      device_configs: '&topic' // Tópico como chave primária única
    });
  }
}

export const db = new ProjectGridDB();
