import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../_lib/db/LocalDatabase";
import { Save, AlertTriangle } from "lucide-react";

interface AlarmSettingsProps {
  topic: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastPayload: any;
}

export function AlarmSettings({ topic, lastPayload }: AlarmSettingsProps) {
  // 1. Identificar chaves numéricas disponíveis no payload
  const availableKeys = React.useMemo(() => {
    if (!lastPayload) return [];

    // Tenta encontrar o objeto de telemetria ou usa o payload raiz
    const telemetry =
      lastPayload.telemetry ||
      lastPayload.sensores ||
      lastPayload.sensors ||
      lastPayload;

    if (typeof telemetry !== "object") return [];

    return Object.keys(telemetry).filter((key) => {
      const val = telemetry[key];
      return (
        typeof val === "number" &&
        !key.includes("timestamp") &&
        !key.includes("id")
      );
    });
  }, [lastPayload]);

  // 2. Carregar configurações do banco
  const config = useLiveQuery(async () => {
    return await db.device_configs.get(topic);
  }, [topic]);

  // 3. Função para salvar limites
  const handleSaveLimit = async (
    key: string,
    type: "min" | "max",
    value: string,
  ) => {
    const numValue = value === "" ? undefined : Number(value);

    const currentLimits = config?.limits || {};
    const keyLimits = currentLimits[key] || {};

    const newLimits = {
      ...currentLimits,
      [key]: {
        ...keyLimits,
        [type]: numValue,
      },
    };

    await db.device_configs.put({
      topic,
      limits: newLimits,
      alias: config?.alias,
    });
  };

  if (availableKeys.length === 0) {
    return (
      <div className="text-gray-400 text-sm p-4 text-center">
        Nenhum dado numérico identificável para configurar alarmes.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <AlertTriangle className="text-orange-500" size={18} />
        <h3 className="font-semibold text-gray-700">Gestão de Alarmes</h3>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <p className="text-xs text-gray-500 mb-4">
          Defina limites para receber alertas visuais quando os valores saírem
          da faixa segura. Os dados são salvos localmente.
        </p>

        {availableKeys.map((key) => {
          const limits = config?.limits?.[key] || {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const telemetry =
            lastPayload?.telemetry ||
            lastPayload?.sensores ||
            lastPayload?.sensors ||
            lastPayload;
          const currentsValue = telemetry?.[key];

          const isHigh = limits.max !== undefined && currentsValue > limits.max;
          const isLow = limits.min !== undefined && currentsValue < limits.min;
          const isAlarm = isHigh || isLow;

          return (
            <div
              key={key}
              className={`p-3 rounded-lg border transition-all ${isAlarm ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700 capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${isAlarm ? "bg-red-200 text-red-700 font-bold" : "bg-gray-100 text-gray-600"}`}
                >
                  Atual: {currentsValue}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    placeholder="Min"
                    defaultValue={limits.min ?? ""}
                    onBlur={(e) => handleSaveLimit(key, "min", e.target.value)}
                    className="w-full text-sm border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                    Máximo
                  </label>
                  <input
                    type="number"
                    placeholder="Max"
                    defaultValue={limits.max ?? ""}
                    onBlur={(e) => handleSaveLimit(key, "max", e.target.value)}
                    className="w-full text-sm border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
        <Save size={12} />
        Alterações salvas automaticamente
      </div>
    </div>
  );
}
