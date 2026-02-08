/**
 * DeviceProcessor.ts
 *
 * Classe utilitária responsável por centralizar a lógica de processamento
 * de dados brutos dos dispositivos IoT.
 *
 * Objetivos:
 * 1. Garantir tipagem segura (sem any).
 * 2. Centralizar regras de negócio (ex: o que é considerado "telemetria").
 * 3. Facilitar testes e manutenção.
 */

// Interface para definir o formato de dados numéricos extraídos
export interface TelemetryData {
  [key: string]: number;
}

export class DeviceProcessor {
  /**
   * Converte um payload desconhecido (string JSON, objeto ou string pura)
   * em um objeto TypeScript seguro (Record<string, unknown>).
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
      } catch (error) {
        // Falha silenciosa no parse, retornamos vazio
        return {};
      }
    }

    return {};
  }

  /**
   * Extrai apenas os campos numéricos (telemetria) de um payload.
   * Procura automaticamente por chaves comuns como 'telemetry', 'sensors' ou usa a raiz.
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
   * Determina se um dispositivo está Online baseado no último "visto" (lastSeen).
   */
  public static isDeviceOnline(lastSeen: number, currentTime: number = Date.now(), toleranceMs: number = 15000): boolean {
    if (!lastSeen) return false;
    const diff = currentTime - lastSeen;
    return diff < toleranceMs;
  }

  /**
   * Tenta encontrar o timestamp dentro do payload, ou usa o timestamp de recebimento.
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
