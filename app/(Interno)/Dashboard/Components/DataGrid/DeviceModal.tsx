/**
 * Modal de Detalhes do Dispositivo.
 * Exibe informações aprofundadas sobre um dispositivo selecionado,
 * alternando entre visualização de gráfico e inspeção de JSON bruto.
 */
import React from "react";
import { X, Maximize2, Activity, Code } from "lucide-react";
import { DeviceChart } from "../Discovery/DeviceChart";
import { AlarmSettings } from "./AlarmSettings";
import { useDeviceHistory } from "../../../_lib/hooks/useDeviceHistory";

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastPayload: any;
}

/**
 * Renderiza o modal sobreposto com as abas de Gráfico e Inspector.
 */
export function DeviceModal({
  isOpen,
  onClose,
  topic,
  lastPayload,
}: DeviceModalProps) {
  const [activeTab, setActiveTab] = React.useState<"chart" | "json">("chart");

  // Hook para dados em tempo real (Pega apenas o último registro)
  const { history } = useDeviceHistory(topic, 1);

  const currentPayload = React.useMemo(() => {
    // Se tiver dados novos chegando, usa o mais recente (último do array cronológico)
    if (history && history.length > 0) {
      return history[history.length - 1].originalPayload;
    }
    // Fallback: usa o payload que veio da tabela ao abrir
    return lastPayload;
  }, [history, lastPayload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="text-blue-500" size={20} />
              {topic.split("/").pop()}
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{topic}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          <button
            onClick={() => setActiveTab("chart")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "chart"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Maximize2 size={16} />
            Gráfico Completo
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "json"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Code size={16} />
            Inspector JSON
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-0 bg-gray-50/30">
          {activeTab === "chart" && (
            <div className="p-0 h-[500px] w-full">
              <DeviceChart topic={topic} />
            </div>
          )}

          {activeTab === "json" && (
            <div className="flex flex-col md:flex-row h-[550px]">
              {/* Coluna JSON Raw (Escuro) */}
              <div className="flex-1 bg-[#1e1e1e] text-green-400 p-6 h-full font-mono text-xs overflow-auto">
                <pre>{JSON.stringify(currentPayload, null, 2)}</pre>
              </div>

              {/* Coluna Painel de Alarmes (Claro) */}
              <div className="w-full md:w-96 border-l border-gray-200 bg-white h-full overflow-hidden">
                <AlarmSettings topic={topic} lastPayload={currentPayload} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
