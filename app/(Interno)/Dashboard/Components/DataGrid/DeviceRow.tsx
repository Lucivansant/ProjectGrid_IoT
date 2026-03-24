/**
 * Linha de Dispositivo na Tabela.
 * Renderiza os dados individuais de um dispositivo, incluindo status,
 * minigráficos (sparklines), resumo da telemetria e alertas de alarme.
 */
import React from "react";
import { Cpu, Maximize2, AlertTriangle } from "lucide-react";
import { SparklineMemo } from "./Sparkline";
import { DiscoveredDevice } from "./DevicesTable";
import { ActiveAlarm } from "../Discovery/AlarmWidget";

interface DeviceRowProps {
  device: DiscoveredDevice;
  onSelect: (device: DiscoveredDevice) => void;
  currentTime: number;
  alarms?: ActiveAlarm[];
  style?: React.CSSProperties;
}

/**
 * Componente funcional interno para renderização da linha.
 */
function DeviceRowComponent({
  device,
  onSelect,
  currentTime,
  alarms,
  style,
}: DeviceRowProps) {
  const isJson = typeof device.lastPayload === "object";
  const payloadPreview = isJson
    ? JSON.stringify(device.lastPayload).slice(0, 40) + "..."
    : String(device.lastPayload).slice(0, 40);

  const isOnline = currentTime - device.lastSeen < 15000;
  const hasAlarms = alarms && alarms.length > 0;

  return (
    <div
      style={style}
      className={`grid grid-cols-12 items-center transition-colors group cursor-pointer border-b border-gray-50 py-3 ${
        hasAlarms
          ? "bg-red-50/40 hover:bg-red-50/70"
          : "hover:bg-blue-50/30"
      }`}
      onClick={() => onSelect(device)}
    >
      {/* Coluna 1: Nome e Tópico (4 colunas) */}
      <div className="col-span-4 px-4 pl-6 flex items-center gap-3 overflow-hidden">
        <div
          className={`p-2 rounded-lg shrink-0 relative ${
            hasAlarms
              ? "bg-red-50 text-red-500"
              : isOnline
              ? "bg-blue-50 text-blue-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <Cpu size={20} />
          {hasAlarms && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
              {alarms!.length}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-800 text-sm truncate flex items-center gap-1.5">
            {device.topic.split("/").pop()}
            {hasAlarms && (
              <AlertTriangle size={12} className="text-red-500 shrink-0" />
            )}
          </div>
          <div
            className="text-[10px] text-gray-400 font-mono truncate"
            title={device.topic}
          >
            {device.topic}
          </div>

          {/* Badges de alarme inline */}
          {hasAlarms && (
            <div className="flex flex-wrap gap-1 mt-1">
              {alarms!.map((alarm, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-700 border border-red-200 font-mono"
                >
                  <span className="font-semibold uppercase">{alarm.metric}</span>
                  <span className="opacity-60">
                    {alarm.type === "max" ? ">" : alarm.type === "min" ? "<" : "="}
                  </span>
                  <span>{alarm.limit}</span>
                  <span className="text-red-400">({alarm.value})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coluna 2: Status (2 colunas) */}
      <div className="col-span-2 px-2 flex flex-col items-center justify-center gap-1">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
            isOnline ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"
          }`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>

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
          color={hasAlarms ? "#ef4444" : isOnline ? "#3b82f6" : "#9ca3af"}
        />
      </div>

      {/* Coluna 4: Preview de Dados (3 colunas) */}
      <div className="col-span-3 px-2 overflow-hidden">
        {device.lastPayload?.rpm !== undefined ||
        device.lastPayload?.temperatura !== undefined ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {device.lastPayload.rpm !== undefined && (
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider">RPM</span>
                <span className="text-xs font-bold text-gray-700">{device.lastPayload.rpm}</span>
              </div>
            )}
            {device.lastPayload.temperatura !== undefined && (
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider">TEMP</span>
                <span className="text-xs font-bold text-gray-700">
                  {Number(device.lastPayload.temperatura).toFixed(1)}°C
                </span>
              </div>
            )}
            {device.lastPayload.corrente !== undefined && (
              <div className="flex flex-col">
                <span className="text-[8px] text-gray-400 uppercase tracking-wider">AMP</span>
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

// Otimização: React.memo
export const DeviceRow = React.memo(DeviceRowComponent, (prev, next) => {
  if (prev.device !== next.device) return false;
  if (prev.alarms !== next.alarms) return false;

  const prevTime = prev.currentTime;
  const nextTime = next.currentTime;
  const wasOnline = prevTime - prev.device.lastSeen < 15000;
  const isNowOnline = nextTime - next.device.lastSeen < 15000;
  if (wasOnline !== isNowOnline) return false;

  if (prev.style?.top !== next.style?.top) return false;

  return true;
});
