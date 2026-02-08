import React from "react";
import { Cpu, Maximize2 } from "lucide-react";
import { SparklineMemo } from "./Sparkline";
import { DiscoveredDevice } from "./DevicesTable";

interface DeviceRowProps {
  device: DiscoveredDevice;
  onSelect: (device: DiscoveredDevice) => void;
  currentTime: number;
  // Prop extra injetada pelo virtualizador (posição absoluta)
  style?: React.CSSProperties;
}

function DeviceRowComponent({
  device,
  onSelect,
  currentTime,
  style,
}: DeviceRowProps) {
  const isJson = typeof device.lastPayload === "object";
  const payloadPreview = isJson
    ? JSON.stringify(device.lastPayload).slice(0, 40) + "..."
    : String(device.lastPayload).slice(0, 40);

  // Cálculo de "Online" baseado em 15s de tolerância
  const isOnline = currentTime - device.lastSeen < 15000;

  return (
    <div
      style={style}
      className="grid grid-cols-12 items-center hover:bg-blue-50/30 transition-colors group cursor-pointer border-b border-gray-50 py-3"
      onClick={() => onSelect(device)}
    >
      {/* Coluna 1: Nome e Tópico (4 colunas) - Aumentei para caber tópico longo */}
      <div className="col-span-4 px-4 pl-6 flex items-center gap-3 overflow-hidden">
        <div
          className={`p-2 rounded-lg shrink-0 ${isOnline ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}
        >
          <Cpu size={20} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-800 text-sm truncate">
            {device.topic.split("/").pop()}
          </div>
          <div
            className="text-[10px] text-gray-400 font-mono truncate"
            title={device.topic}
          >
            {device.topic}
          </div>
        </div>
      </div>

      {/* Coluna 2: Status (2 colunas) - Centralizado */}
      <div className="col-span-2 px-2 flex flex-col items-center justify-center gap-1">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${isOnline ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"}`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>

        {/* Status da Máquina (Customizado para nossa Injetora) */}
        {device.lastPayload?.status && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              String(device.lastPayload.status).toUpperCase() === "OPERANDO"
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-orange-50 text-orange-600 border-orange-100"
            }`}
          >
            {String(device.lastPayload.status).toUpperCase()}
          </span>
        )}

        <span className="text-[9px] text-gray-400 whitespace-nowrap">
          {new Date(device.lastSeen).toLocaleTimeString()}
        </span>
      </div>

      {/* Coluna 3: Sparkline (2 colunas) */}
      <div className="col-span-2 px-2 h-10">
        <SparklineMemo
          topic={device.topic}
          color={isOnline ? "#3b82f6" : "#9ca3af"}
        />
      </div>

      {/* Coluna 4: Preview de Dados (3 colunas) */}
      <div className="col-span-3 px-2 overflow-hidden">
        {/* Detecção Automática de Métricas Industriais */}
        {device.lastPayload?.rpm !== undefined ||
        device.lastPayload?.temperatura !== undefined ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {device.lastPayload.rpm !== undefined && (
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider">
                  RPM
                </span>
                <span className="text-xs font-bold text-gray-700">
                  {device.lastPayload.rpm}
                </span>
              </div>
            )}
            {device.lastPayload.temperatura !== undefined && (
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider">
                  TEMP
                </span>
                <span className="text-xs font-bold text-gray-700">
                  {Number(device.lastPayload.temperatura).toFixed(1)}°C
                </span>
              </div>
            )}
            {device.lastPayload.corrente !== undefined && (
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider">
                  AMP
                </span>
                <span className="text-xs font-bold text-gray-700">
                  {Number(device.lastPayload.corrente).toFixed(1)}A
                </span>
              </div>
            )}
          </div>
        ) : (
          <code className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100 font-mono block truncate">
            {payloadPreview}
          </code>
        )}
      </div>

      {/* Coluna 5: Ações (1 coluna) */}
      <div className="col-span-1 px-4 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(device);
          }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}

// Otimização Crucial: React.memo
export const DeviceRow = React.memo(DeviceRowComponent, (prev, next) => {
  // Verificar se style mudou (scroll) não é necessário pois react-window recria o componente
  // Mas é bom manter as checagens de dados
  if (prev.device !== next.device) return false;

  const prevTime = prev.currentTime;
  const nextTime = next.currentTime;
  const wasOnline = prevTime - prev.device.lastSeen < 15000;
  const isNowOnline = nextTime - next.device.lastSeen < 15000;

  if (wasOnline !== isNowOnline) return false;

  // IMPORTANTE: Para virtualização, se o 'style' mudar (posição top/left), PRECISA renderizar.
  // Como 'style' é um objeto novo a cada scroll, a comparação rasa 'prev.style === next.style' falharia sempre se não cuidarmos.
  // Porém, aqui estamos retornando 'true' (não renderizar) se os dados forem iguais.
  // SE O STYLE MUDAR, o React.memo padrão já renderizaria.
  // Ao implementar custom comparison function, precisamos explicitamente checar style também.

  // Correção: Comparação de style properties chaves (top)
  if (prev.style?.top !== next.style?.top) return false;

  return true;
});
