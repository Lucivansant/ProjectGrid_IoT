import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "../db/LocalDatabase";
import { DeviceProcessor, TelemetryData } from "../utils/DeviceProcessor";

export interface ProcessedHistoryItem {
  timestamp: number;
  timeLabel: string;
  telemetry: TelemetryData;
  originalPayload: Record<string, unknown>;
}

/**
 * Hook para buscar e processar histórico de mensagens de um dispositivo.
 * Retorna dados prontos para consumo por gráficos (recharts) e tabelas.
 */
export function useDeviceHistory(topic: string, limit: number = 50) {
  // Query reativa ao banco de dados local
  const rawHistory = useLiveQuery(async () => {
    if (!topic) return [];
    
    return await db.messages
      .where("topic")
      .equals(topic)
      .reverse()
      .limit(limit)
      .toArray();
  }, [topic, limit]);

  // Transformação dos dados
  // Nota: Executa a cada atualização do rawHistory
  const history = useMemo(() => {
     return (rawHistory || []).map(record => {
      const safePayload = DeviceProcessor.safeParse(record.payload);
      const telemetry = DeviceProcessor.extractTelemetry(safePayload);
      const timestamp = DeviceProcessor.getTimestamp(safePayload, record.timestamp);
      
      return {
        timestamp,
        timeLabel: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        telemetry,
        originalPayload: safePayload
      };
    }).reverse();
  }, [rawHistory]);

  // Extrai chaves únicas de telemetria encontradas no histórico
  const availableKeys = useMemo(() => {
    return Array.from(new Set(
      history.flatMap(item => Object.keys(item.telemetry))
    ));
  }, [history]);

  return {
    rawData: rawHistory || [],
    history,
    availableKeys,
    isLoading: rawHistory === undefined
  };
}
