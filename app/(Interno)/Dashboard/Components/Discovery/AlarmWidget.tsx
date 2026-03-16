import React, { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Bell, AlertTriangle, X } from "lucide-react";
import { db } from "../../../_lib/db/LocalDatabase";
import { DiscoveredDevice } from "../DataGrid/DevicesTable";
import { DeviceProcessor } from "../../../_lib/utils/DeviceProcessor";

interface AlarmWidgetProps {
  devices: DiscoveredDevice[];
}

interface ActiveAlarm {
  topic: string;
  metric: string;
  value: number | string;
  limit: number | string;
  type: "min" | "max" | "exact";
}

export function AlarmWidget({ devices }: AlarmWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Busca configurações de alarmes
  const configs = useLiveQuery(() => db.device_configs.toArray(), []);

  // 2. Calcula alarmes ativos
  const activeAlarms = useMemo(() => {
    if (!configs || devices.length === 0) return [];

    const results: ActiveAlarm[] = [];
    const configMap = new Map(configs.map((c) => [c.topic, c]));

    for (const device of devices) {
      const config = configMap.get(device.topic);
      if (!config?.limits) continue;

      const safePayload = DeviceProcessor.safeParse(device.lastPayload);
      const telemetry = DeviceProcessor.extractTelemetry(safePayload);

      for (const [key, val] of Object.entries(telemetry)) {
        const limit = config.limits[key];
        if (!limit) continue;

        const isNumericLike =
          typeof val === "number" ||
          (typeof val === "string" && !isNaN(parseFloat(val)));
        const parsedNumeric = isNumericLike ? parseFloat(String(val)) : null;

        if (isNumericLike && parsedNumeric !== null) {
          if (limit.max !== undefined && parsedNumeric > limit.max) {
            results.push({
              topic: device.topic,
              metric: key,
              value: String(val),
              limit: limit.max,
              type: "max",
            });
          }
          if (limit.min !== undefined && parsedNumeric < limit.min) {
            results.push({
              topic: device.topic,
              metric: key,
              value: String(val),
              limit: limit.min,
              type: "min",
            });
          }
        }

        if (
          limit.exactMatch !== undefined &&
          String(val).toLowerCase() === limit.exactMatch.toLowerCase()
        ) {
          results.push({
            topic: device.topic,
            metric: key,
            value: String(val),
            limit: limit.exactMatch,
            type: "exact",
          });
        }
      }
    }
    return results;
  }, [devices, configs]);

  // 3. Agrupamento por Dispositivo
  const groupedAlarms = useMemo(() => {
    const groups = new Map<
      string,
      { topic: string; totalAnomalies: number; alarms: ActiveAlarm[] }
    >();

    activeAlarms.forEach((alarm) => {
      if (!groups.has(alarm.topic)) {
        groups.set(alarm.topic, {
          topic: alarm.topic,
          totalAnomalies: 0,
          alarms: [],
        });
      }
      const group = groups.get(alarm.topic)!;
      group.totalAnomalies++;
      group.alarms.push(alarm);
    });

    return Array.from(groups.values());
  }, [activeAlarms]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center ${
          activeAlarms.length > 0
            ? "bg-red-500 text-white animate-bounce-slow shadow-red-500/30"
            : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50"
        }`}
      >
        <Bell
          size={24}
          className={activeAlarms.length > 0 ? "fill-current" : ""}
        />
        {activeAlarms.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 border border-red-100 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
            {activeAlarms.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col max-h-[60vh] animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 backdrop-blur rounded-t-xl">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle
                size={18}
                className={
                  activeAlarms.length > 0 ? "text-red-500" : "text-gray-400"
                }
              />
              Central de Alertas
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-2 space-y-2 bg-gray-50/30">
            {groupedAlarms.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                <p>Nenhum alerta ativo no momento.</p>
                <p className="text-xs mt-1 text-gray-300">
                  O sistema está operando normalmente.
                </p>
              </div>
            ) : (
              groupedAlarms.map((group) => (
                <div
                  key={group.topic}
                  className="bg-red-50/30 p-3 rounded-lg border border-red-100 shadow-sm flex flex-col gap-2 hover:bg-red-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-red-50 text-red-500 rounded-md shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                          {group.topic.split("/").pop()}
                        </h4>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          {group.totalAnomalies}{" "}
                          {group.totalAnomalies === 1 ? "Alerta" : "Alertas"}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mb-2 truncate">
                        {group.topic}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {group.alarms.map((alarm, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-700 border border-red-100/50"
                          >
                            <span className="font-medium uppercase">
                              {alarm.metric}
                            </span>
                            <span className="font-mono font-bold">
                              {alarm.value}
                            </span>
                            <span className="text-red-400 opacity-75 text-[9px]">
                              {alarm.type === "max"
                                ? ">"
                                : alarm.type === "min"
                                  ? "<"
                                  : "=="}
                              {alarm.limit}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {activeAlarms.length > 0 && (
            <div className="p-3 bg-red-50 border-t border-red-100 rounded-b-xl text-center">
              <span className="text-xs font-medium text-red-600">
                Atenção Necessária
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
