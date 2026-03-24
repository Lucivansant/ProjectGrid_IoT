/**
 * Processador de Dados de Dispositivos.
 * Centraliza a lógica de tratamento, validação e extração de telemetria
 * a partir das mensagens brutas recebidas via MQTT.
 */

// Interface para definir o formato de dados numéricos extraídos
export interface TelemetryData {
  [key: string]: number;
}

export class DeviceProcessor {
  /**
   * Realiza o parse seguro de um payload JSON.
   */
  public static safeParse(rawPayload: unknown): Record<string, unknown> {
    if (!rawPayload) {
      return {};
    }

    // Se já for objeto, fazemos um cast seguro
    if (typeof rawPayload === "object") {
      return rawPayload as Record<string, unknown>;
    }

    // Se for string, tentamos fazer o parse
    if (typeof rawPayload === "string") {
      try {
        const parsed = JSON.parse(rawPayload);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Falha silenciosa no parse, retornamos vazio
        return {};
      }
    }

    return {};
  }

  /**
   * Filtra e extrai apenas campos numéricos do payload para telemetria.
   */
  public static extractTelemetry(payload: Record<string, unknown>): TelemetryData {
    // 1. Tenta encontrar um sub-objeto específico de dados
    let sourceData = payload;

    // Lista de chaves possíveis onde os dados podem estar aninhados
    const possibleKeys = ["telemetry", "sensores", "sensors", "data"];

    for (const key of possibleKeys) {
      if (
        key in payload &&
        typeof payload[key] === "object" &&
        payload[key] !== null
      ) {
        sourceData = payload[key] as Record<string, unknown>;
        break;
      }
    }

    // 2. Filtra apenas o que é número
    const result: TelemetryData = {};

    Object.keys(sourceData).forEach((key) => {
      const value = sourceData[key];
      
      // Ignoramos campos que parecem IDs ou timestamps para focar em métricas
      if (key.includes("id") || key === "timestamp" || key === "ts") {
        return;
      }

      // Convertemos para número e validamos
      const numValue = Number(value);
      if (!isNaN(numValue) && typeof value !== 'object') {
        result[key] = numValue;
      }
    });

    return result;
  }

  /**
   * Verifica se o dispositivo está com status online baseado na última atividade.
   */
  public static isDeviceOnline(lastSeen: number, currentTime: number = Date.now(), toleranceMs: number = 15000): boolean {
    if (!lastSeen) return false;
    const diff = currentTime - lastSeen;
    return diff < toleranceMs;
  }

  /**
   * Obtém o timestamp do payload ou retorna o fallback.
   */
  public static getTimestamp(payload: Record<string, unknown>, fallbackTimestamp: number): number {
    if (typeof payload.timestamp === 'number') {
      return payload.timestamp;
    }
    if (typeof payload.ts === 'number') {
      return payload.ts;
    }
    return fallbackTimestamp;
  }
}
