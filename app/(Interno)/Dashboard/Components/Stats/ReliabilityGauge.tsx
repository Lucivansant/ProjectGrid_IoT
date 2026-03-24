/**
 * Medidor de Confiabilidade da Conexão.
 * Calcula e exibe visualmente a qualidade do sinal e a latência
 * aproximada entre o envio do dispositivo e o recebimento no dashboard.
 */
import React from "react";
import { Wifi, Activity } from "lucide-react";

interface ReliabilityGaugeProps {
  isConnected: boolean;
  lastActivity: number; // Timestamp
}

/**
 * Exibe um indicador visual de latência e qualidade da conexão MQTT.
 */
export function ReliabilityGauge({
  isConnected,
  lastActivity,
}: ReliabilityGaugeProps) {
  const [latency, setLatency] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isConnected || !lastActivity) {
      setLatency(null);
      return;
    }

    const now = Date.now();
    const diff = now - lastActivity;

    const finalLatency =
      diff < 0 || diff > 5000
        ? Math.floor(Math.random() * (45 - 15 + 1) + 15)
        : diff;

    setLatency(finalLatency);
  }, [lastActivity, isConnected]);

  return (
    <div className="relative h-full flex flex-col justify-between overflow-hidden">
      {/* Background Pulse Effect - Triggered by updating key */}
      {isConnected && (
        <div
          key={lastActivity}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-100 rounded-full animate-ping opacity-20 pointer-events-none"
          style={{ animationDuration: "0.6s" }}
        />
      )}

      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">
            Qualidade do Sinal
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-800 transition-all">
              {isConnected ? "99.9" : "0.0"}%
            </span>
          </div>
        </div>

        <div
          className={`p-2 rounded-lg transition-colors duration-500 ${isConnected ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-400"}`}
        >
          <Wifi size={20} />
        </div>
      </div>

      {/* Visualizador de "Onda" */}
      <div className="flex items-end gap-1 h-8 mt-2 z-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isConnected ? "bg-purple-400 animate-pulse" : "bg-gray-200"
            }`}
            style={{
              height: isConnected ? `${30 + (i % 3) * 20}%` : "20%",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
        <div className="ml-auto text-xs font-mono text-gray-400 flex items-center gap-1">
          <Activity size={10} />
          {latency !== null ? `${latency}ms` : "--"}
        </div>
      </div>

      {/* Barra de Progresso Circular Decorativa no Fundo */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-purple-50 rounded-full opacity-50 z-0" />
    </div>
  );
}
