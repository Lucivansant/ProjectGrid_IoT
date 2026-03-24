/**
 * Gráfico de Dispositivo.
 * Renderiza um gráfico de área em tempo real utilizando a biblioteca Recharts,
 * com suporte a múltiplas métricas e detecção visual de status offline.
 */
import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, WifiOff } from "lucide-react";
import { useDeviceHistory } from "../../../_lib/hooks/useDeviceHistory";
import { DeviceProcessor } from "../../../_lib/utils/DeviceProcessor";

interface DeviceChartProps {
  topic: string;
}

/**
 * Exibe a telemetria histórica de um dispositivo em formato de gráfico.
 */
export function DeviceChart({ topic }: DeviceChartProps) {
  // 1. Hook Inteligente: Busca e processa tudo automaticamente
  const { history, availableKeys, isLoading } = useDeviceHistory(topic, 50);

  // 2. Determina chaves ativas (Automático ou Manual)
  const [manualKeys] = useState<string[]>([]);

  const activeKeys = useMemo(() => {
    if (manualKeys.length > 0) return manualKeys;

    return availableKeys
      .filter((k) => !k.includes("id") && k !== "status")
      .slice(0, 2);
  }, [availableKeys, manualKeys]);

  // Heartbeat local para atualizar status Offline mesmo sem novos dados
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(timer);
  }, []);

  // 3. Verificação de Status Offline usando utilitário
  const isOffline = useMemo(() => {
    if (history.length === 0) return false;
    // History é ordenado cronologicamente, último é o mais recente
    const lastItem = history[history.length - 1];
    return !DeviceProcessor.isDeviceOnline(lastItem.timestamp, now, 7000);
  }, [history, now]);

  // 4. Prepara dados para o Recharts
  const chartData = useMemo(() => {
    return history.map((item) => ({
      time: item.timeLabel,
      ...item.telemetry, // Espalha { power_w: 123, temp: 45 } na raiz do objeto
    }));
  }, [history]);

  // Estados de Carregamento / Vazio
  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-gray-500">
        Aguardando dados...
      </div>
    );
  }

  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div className="w-full h-full relative group overflow-hidden rounded-lg">
      {/* Alerta de Offline Overlay — overflow-hidden no pai garante que cobre TODO o chart */}
      {isOffline && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-red-100 transition-all duration-500 animate-in fade-in zoom-in-95">
          <div className="bg-red-50 text-red-500 p-3 rounded-full mb-2 shadow-sm animate-pulse">
            <WifiOff size={24} />
          </div>
          <span className="text-sm font-bold text-red-600 bg-white px-3 py-1 rounded-full shadow-sm border border-red-100">
            Sinal Perdido
          </span>
          <span className="text-[10px] text-red-400 mt-1 font-medium bg-white/80 px-2 rounded">
            Nenhum dado recebido há {">"}7s
          </span>
        </div>
      )}

      {/* Área do Gráfico — blur e desaturação aqui, sem backdrop no overlay */}
      <div
        className={`w-full h-full transition-all duration-500 ${isOffline ? "opacity-30 grayscale blur-[2px]" : "opacity-100"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {activeKeys.map((key, index) => (
                <linearGradient
                  key={key}
                  id={`color${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={colors[index % colors.length]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors[index % colors.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            {/* Geramos eixos Y independentes para cada métrica */}
            {activeKeys.map((key, index) => (
              <YAxis
                key={key}
                yAxisId={index}
                orientation={index % 2 === 0 ? "left" : "right"}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={30}
                domain={["auto", "auto"]}
              />
            ))}

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{
                fontSize: "12px",
                color: "#666",
                marginBottom: "4px",
              }}
            />

            {activeKeys.map((key, index) => (
              <Area
                key={key}
                yAxisId={index}
                type="monotone"
                dataKey={key}
                name={key.replace(/_/g, " ").toUpperCase()}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color${key})`}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
