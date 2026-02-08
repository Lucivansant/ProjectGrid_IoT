"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../_lib/db/LocalDatabase";
import { Cpu, Activity } from "lucide-react";
import { StorageStatusWidget } from "./StorageStatusWidget";
import { DevicesTable, DiscoveredDevice } from "../DataGrid/DevicesTable";
import { AlarmWidget } from "./AlarmWidget";

interface DiscoveryGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentData: any | null; // Dados chegando em tempo real do hook MQTT
  currentTopic: string; // Tópico atual (para contexto)
  brokerId: string; // Para segregar dados por broker
}

export function DiscoveryGrid({
  currentData,
  currentTopic,
  brokerId,
}: DiscoveryGridProps) {
  const [devices, setDevices] = useState<Map<string, DiscoveredDevice>>(
    new Map(),
  );

  // 0. Carregar histórico inicial (Rehidratação)
  useEffect(() => {
    if (!brokerId) return;

    const loadCachedDevices = async () => {
      try {
        // Busca as últimas 200 mensagens para encontrar dispositivos ativos recentemente
        const cachedMsgs = await db.messages
          .where("brokerId")
          .equals(brokerId)
          .reverse() // Do mais recente para o antigo
          .limit(200)
          .toArray();

        if (cachedMsgs.length === 0) return;

        setDevices((prev) => {
          const newMap = new Map(prev);

          cachedMsgs.forEach((msg) => {
            // Só adiciona se ainda não tivermos esse dispositivo na memória
            if (!newMap.has(msg.topic)) {
              newMap.set(msg.topic, {
                topic: msg.topic,
                lastPayload: msg.payload,
                lastSeen: msg.timestamp,
                messageCount: 1, // Indica que é histórico
              });
            }
          });

          return newMap;
        });
      } catch (err) {
        console.error("Erro ao carregar cache:", err);
      }
    };

    loadCachedDevices();
  }, [brokerId]);

  // 1. Processar dados chegando em Tempo Real
  const lastProcessedRef = React.useRef<number>(0);

  useEffect(() => {
    // Evita processar se não houver dados
    if (!currentData || !brokerId) return;

    const processMessage = async () => {
      // Timestamp original da mensagem (gerado no hook ou simulador)
      // É crucial usar ESTE timestamp e não Date.now() para permitir deduplicação
      const msgTimestamp = currentData.timestamp || Date.now();

      // Deduplicação em Memória (Rápida - para updates no mesmo ciclo de vida)
      if (msgTimestamp === lastProcessedRef.current) return;

      try {
        // Deduplicação Persistente (Banco - para navegação/remontagem)
        // Verifica se a última mensagem gravada para este tópico tem o mesmo timestamp
        const lastMsg = await db.messages
          .where("topic")
          .equals(currentTopic)
          .reverse()
          .first();

        if (lastMsg && lastMsg.timestamp === msgTimestamp) {
          // Já existe no banco (foi gravada antes de desmontar o componente)
          // Apenas atualizamos a referência local para não checar de novo
          lastProcessedRef.current = msgTimestamp;
          return;
        }

        // Se passar nas checagens, é dado novo.
        lastProcessedRef.current = msgTimestamp;

        // VERIFICAÇÃO ANTI-ZOMBIE (Mensagens Retidas/Antigas)
        const msgAge = Date.now() - msgTimestamp;
        const isOldMessage = msgAge > 10000; // 10 segundos de tolerância

        if (!isOldMessage) {
          await db.messages.add({
            topic: currentTopic,
            payload: currentData.message,
            brokerId: brokerId,
            timestamp: msgTimestamp,
          });
        }

        // Atualizar Estado Visual (Memória)
        setDevices((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(currentTopic) || {
            topic: currentTopic,
            lastPayload: null,
            lastSeen: 0,
            messageCount: 0,
          };

          newMap.set(currentTopic, {
            topic: currentTopic,
            lastPayload: currentData.message,
            lastSeen: msgTimestamp,
            messageCount: existing.messageCount + 1,
          });
          return newMap;
        });
      } catch (err) {
        console.error("Erro ao processar mensagem:", err);
      }
    };

    processMessage();
  }, [currentData, currentTopic, brokerId]);

  // Converter Map para Array para renderizar
  const deviceList = Array.from(devices.values());

  if (deviceList.length === 0) {
    return (
      <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center animate-pulse">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700">
          Aguardando Dados...
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
          Conectado ao broker. Assim que um dispositivo publicar no tópico, ele
          aparecerá aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          Dispositivos Descobertos ({deviceList.length})
        </h2>

        <StorageStatusWidget
          brokerId={brokerId}
          onClearComplete={() => {
            // Limpa o estado visual da memória (Cards)
            setDevices(new Map());
            // Mantemos lastProcessedRef intacto para evitar re-processar a msg atual
          }}
        />
      </div>

      {/* Renderização da Tabela Nova */}
      <DevicesTable devices={deviceList} />

      {/* Widget Flutuante de Alarmes Globais */}
      <AlarmWidget devices={deviceList} />
    </div>
  );
}
