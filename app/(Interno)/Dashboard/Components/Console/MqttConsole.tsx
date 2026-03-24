/**
 * Console de Mensagens MQTT.
 * Fornece uma visualização estilo terminal em tempo real das mensagens JSON
 * que chegam de um determinado tópico, útil para depuração rápida.
 */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Terminal, XCircle, ArrowDown } from "lucide-react";
import { SensorData } from "../../../_lib/services/UniversalMqttClient";

interface LogMessage {
  id: string;
  timestamp: string;
  topic: string;
  payload: string;
}

interface MqttConsoleProps {
  topic: string;
  lastMessage: SensorData | null;
}

/**
 * Componente funcional de terminal para monitoramento de pacotes MQTT.
 */
export function MqttConsole({ topic, lastMessage }: MqttConsoleProps) {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Efeito para adicionar nova mensagem ao log
  useEffect(() => {
    if (lastMessage) {
      const newLog: LogMessage = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        topic: topic,
        payload: JSON.stringify(lastMessage, null, 2),
      };

      // Use setTimeout to avoid synchronous state update warning during render cycles
      setTimeout(() => {
        setLogs((prev) => {
          // Evita duplicação se o último log for idêntico (timestamp do dado)
          const lastLog = prev[prev.length - 1];
          if (lastLog && lastLog.payload === newLog.payload) {
            return prev;
          }

          const newLogs = [...prev, newLog];
          if (newLogs.length > 50) newLogs.shift();
          return newLogs;
        });
      }, 0);
    }
  }, [lastMessage, topic]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex flex-col h-[400px]">
      {/* Header do Terminal */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="text-green-400 w-5 h-5" />
          <span className="text-gray-200 font-mono text-sm font-bold">
            Terminal MQTT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{topic}</span>
          <button
            onClick={() => setLogs([])}
            className="text-gray-500 hover:text-red-400"
            title="Limpar Logs"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Corpo do Terminal */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs md:text-sm space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {logs.length === 0 && (
          <div className="text-gray-600 italic text-center mt-10">
            Aguardando dados...
            <br />
            Inicie seu dispositivo para ver os logs aqui.
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="group">
            <div className="flex items-start gap-2 text-gray-300">
              <span className="text-blue-400 shrink-0">[{log.timestamp}]</span>
              <span className="text-yellow-600 shrink-0">{">>"}</span>
              <span className="break-all whitespace-pre-wrap">
                {log.payload}
              </span>
            </div>
            <div className="h-px bg-gray-800 w-full mt-1 group-last:hidden" />
          </div>
        ))}

        {/* Marcador final */}
        <div className="flex items-center gap-2 text-green-500 animate-pulse mt-2">
          <ArrowDown className="w-3 h-3" />
          <span>Recebendo dados...</span>
        </div>
      </div>
    </div>
  );
}
