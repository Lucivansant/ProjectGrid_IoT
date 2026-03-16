import mqtt from 'mqtt';

export interface MqttConnectionConfig {
  brokerUrl: string;    // ex: "wss://broker.hivemq.com:8884/mqtt"
  username?: string;
  password?: string;
  clientId?: string;
}

// Tipo seguro para valores vindos de JSON desconhecido
export type JsonValue = string | number | boolean | null | undefined | { [key: string]: JsonValue } | JsonValue[];

export interface SensorData {
  timestamp: number;
  sensors: Record<string, JsonValue>; // Flexível, mas seguro
  status: Record<string, JsonValue>;
  topic: string;
  message: JsonValue | string; // Raw or Parsed Payload
}

export class UniversalMqttClient {
  private client: mqtt.MqttClient | null = null;
  private messageHandlers: ((topic: string, data: SensorData) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];

  constructor(private config: MqttConnectionConfig) {
    // Garante ID único se não for fornecido
    if (!this.config.clientId) {
      this.config.clientId = `projectgrid_web_${Math.random().toString(16).slice(2, 10)}`;
    }
  }

  connect(): void {
    console.log(`📡 Conectando ao broker: ${this.config.brokerUrl}`);

    // Opções de conexão compatíveis com a maioria dos brokers (HiveMQ, Mosquitto, AWS)
    const options: mqtt.IClientOptions = {
      clientId: this.config.clientId,
      username: this.config.username,
      password: this.config.password,
      keepalive: 60,
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 2000, // Tenta reconectar a cada 2s
      connectTimeout: 30 * 1000,
    };

    try {
      this.client = mqtt.connect(this.config.brokerUrl, options);

      this.client.on('connect', () => {
        console.log('✅ MQTT Conectado com Sucesso!');
        this.connectionHandlers.forEach(handler => handler(true));
      });

      this.client.on('message', (topic, message) => {
        let safeData: SensorData;
        const payloadStr = message.toString();

        try {
          const parsedData = JSON.parse(payloadStr);
          
          // Normaliza os dados para garantir que tenham timestamp
          safeData = {
            timestamp: parsedData.timestamp || Date.now(),
            sensors: parsedData.sensors || parsedData, // Aceita formato plano ou aninhado
            status: parsedData.status || {},
            topic: topic,
            message: parsedData
          };
        } catch {
          // Fallback para String Raw (Não JSON)
          safeData = {
            timestamp: Date.now(),
            sensors: {},
            status: {},
            topic: topic,
            message: String(payloadStr) // Guarda a string original
          };
        }

        this.messageHandlers.forEach(handler => handler(topic, safeData));
      });

      this.client.on('error', (err) => {
        console.error('❌ Erro MQTT:', err);
        this.errorHandlers.forEach(handler => handler(err));
        this.connectionHandlers.forEach(handler => handler(false));
      });

      this.client.on('offline', () => {
        console.log('zzz MQTT Offline');
        this.connectionHandlers.forEach(handler => handler(false));
      });

    } catch (error) {
      console.error('Falha crítica ao iniciar MQTT:', error);
    }
  }

  subscribe(topic: string): void {
    if (this.client && this.client.connected) {
      try {
        this.client.subscribe(topic, (err, granted) => {
          if (err) {
            console.error(`❌ Erro ao assinar ${topic}:`, err);
            // Evita crash se for ErrorWithSubackPacket
            const errorMsg = err.message || "Erro desconhecido na subscrição";
            this.errorHandlers.forEach(h => h(new Error(`Sub: ${errorMsg}`)));
          } else {
            console.log(`👂 Ouvindo tópico: ${topic}`, granted);
          }
        });
      } catch (e) {
        console.error("Falha ao chamar subscribe:", e);
      }
    }
  }

  publish(topic: string, message: object | string): void {
    if (this.client && this.client.connected) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      this.client.publish(topic, payload);
    } else {
      console.warn('⚠️ Tentativa de publicar sem conexão ativa');
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.end(true); // Força queda imediata
      this.client = null;
    }
  }

  // Hooks para a Interface (React)
  onMessage(handler: (topic: string, data: SensorData) => void) {
    this.messageHandlers.push(handler);
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
  }

  onError(handler: (error: Error) => void) {
    this.errorHandlers.push(handler);
  }
}
