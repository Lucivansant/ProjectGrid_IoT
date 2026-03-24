"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  X, HardDrive, Cpu, Wifi, WifiOff, Loader2,
  Database, TrendingUp, Clock, BarChart2, Activity,
} from "lucide-react";
import { db, MqttMessageRecord } from "../../../_lib/db/LocalDatabase";

interface StorageStatsModalProps {
  brokerId: string;
  deviceCount: number;
  isConnected: boolean;
  connectionError?: string | null;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function StorageStatsModal({
  brokerId,
  deviceCount,
  isConnected,
  connectionError,
  onClose,
}: StorageStatsModalProps) {
  const [quota, setQuota] = useState(0);
  const [usage, setUsage] = useState(0);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    navigator.storage?.estimate().then((e) => {
      setQuota(e.quota ?? 0);
      setUsage(e.usage ?? 0);
    });
  }, []);

  const allMessages = useLiveQuery(
    () => {
      if (!brokerId) return [];
      return db.messages.where("brokerId").equals(brokerId).sortBy("timestamp");
    },
    [brokerId],
  ) as MqttMessageRecord[] | undefined;

  const stats = useMemo(() => {
    if (!allMessages) return null;

    const total = allMessages.length;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTs = todayStart.getTime();
    const lastHourTs = now - 3_600_000;

    const today = allMessages.filter((m) => m.timestamp >= todayTs).length;
    const lastHour = allMessages.filter((m) => m.timestamp >= lastHourTs).length;

    const recent = allMessages.slice(-20);
    let rate: number | null = null;
    if (recent.length >= 2) {
      const span = recent[recent.length - 1].timestamp - recent[0].timestamp;
      if (span > 0) rate = Math.round((recent.length / span) * 60_000);
    }

    const byTopic = new Map<string, number>();
    allMessages.forEach((m) => {
      byTopic.set(m.topic, (byTopic.get(m.topic) ?? 0) + 1);
    });
    const topicList = Array.from(byTopic.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({
        topic,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }));

    const histogram: number[] = Array(12).fill(0);
    allMessages.forEach((m) => {
      const age = now - m.timestamp;
      const bucket = Math.floor(age / 3_600_000);
      if (bucket >= 0 && bucket < 12) histogram[11 - bucket]++;
    });
    const maxBucket = Math.max(...histogram, 1);

    const sample = allMessages.slice(-50);
    const avgSize =
      sample.length > 0
        ? sample.reduce((a, m) => a + JSON.stringify(m).length, 0) / sample.length
        : 500;
    const estimatedUsed = avgSize * total;
    const capacity = quota > 0 ? Math.floor((quota - estimatedUsed) / avgSize) : 0;

    return {
      total,
      today,
      lastHour,
      rate,
      topicList,
      histogram,
      maxBucket,
      estimatedUsed,
      capacity,
    };
  }, [allMessages, now, quota]);

  const usedPct = quota > 0 ? Math.min((usage / quota) * 100, 100) : 0;
  const barColor = usedPct > 80 ? "bg-amber-500" : "bg-slate-400";

  const statusColor = isConnected
    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
    : connectionError
    ? "text-rose-600 bg-rose-50 border-rose-100"
    : "text-amber-600 bg-amber-50 border-amber-100";

  const isConnecting = !isConnected && !connectionError;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">

        {/* ── Header: Limpo e Profissional ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
              <Database size={20} className="text-slate-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">
                Status do Sistema
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Diagnóstico de telemetria local</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${statusColor}`}>
              {isConnecting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : isConnected ? (
                <Wifi size={12} />
              ) : (
                <WifiOff size={12} />
              )}
              {isConnected ? "Sistema Ativo" : connectionError ? "Erro de Link" : "Sincronizando"}
            </div>
            <button
              onClick={onClose}
              className="p-1 px-2 rounded hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-auto p-6 space-y-8">

          {/* ── Row de KPIs: Sóbria ── */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Geral", value: formatNum(stats?.total ?? 0), icon: <Database size={14} /> },
              { label: "Ciclo Hoje", value: formatNum(stats?.today ?? 0), icon: <Clock size={14} /> },
              { label: "Janela 1h", value: formatNum(stats?.lastHour ?? 0), icon: <Activity size={14} /> },
              { label: "Taxa Atual", value: stats?.rate != null ? `${stats.rate}/min` : "—", icon: <TrendingUp size={14} /> },
            ].map((kpi, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  {kpi.icon}
                  <span className="text-[9px] font-bold uppercase tracking-widest">{kpi.label}</span>
                </div>
                <div className="text-xl font-bold text-slate-700 tracking-tight">{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* ── Gráfico de Carga: Monocromático ── */}
          <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Volume de Mensagens (12h)
                </h3>
              </div>
            </div>
            <div className="flex items-end gap-1 h-24 px-1">
              {(stats?.histogram ?? Array(12).fill(0)).map((v, i) => {
                const pct = stats?.maxBucket ? Math.max((v / stats.maxBucket) * 100, v > 0 ? 10 : 4) : 4;
                const isNow = i === 11;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                    <div
                      className={`w-full rounded-sm transition-all duration-700 ${
                        isNow ? "bg-slate-600" : "bg-slate-200 hover:bg-slate-300"
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                    {v > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded shadow-xl pointer-events-none z-10 font-mono">
                        {v}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest px-1">
              <span>Início do Período</span>
              <span>Leitura Atual</span>
            </div>
          </div>

          {/* ── Distribuição: Sóbria ── */}
          {stats && stats.topicList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Distribuição por Tópico
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  {deviceCount} NODES ATIVOS
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {stats.topicList.slice(0, 6).map((t) => (
                  <div key={t.topic} className="flex items-center gap-4 p-2 bg-slate-50/30 rounded border border-transparent hover:border-slate-100 transition-colors">
                    <div className="text-[10px] text-slate-500 font-mono font-bold truncate w-40 shrink-0">
                      /{t.topic.split("/").pop()}
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-slate-400 transition-all duration-700"
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-600 w-20 text-right shrink-0">
                      {t.count} <span className="text-slate-300 ml-1">[{t.pct}%]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Armazenamento: Neutro ── */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4 px-1">
              <HardDrive size={14} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Storage Index (IndexedDB)</h3>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2.5">
                <span>Espaço Utilizado</span>
                <span>{formatBytes(usage)} / {formatBytes(quota)}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-5">
                <div
                  className={`h-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${Math.max(usedPct, 1)}%` }}
                />
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-200">
                {[
                  { label: "Buffer Livre", value: formatBytes(Math.max(quota - usage, 0)), valColor: "text-slate-700" },
                  { label: "Ocupação", value: `${usedPct.toFixed(2)}%`, valColor: usedPct > 80 ? "text-amber-600" : "text-slate-700" },
                  {
                    label: "Mensagens Restantes",
                    value: stats?.capacity != null && stats.capacity > 0 ? formatNum(stats.capacity) : "—",
                    valColor: "text-slate-700",
                  },
                ].map((row, i) => (
                  <div key={i} className="text-center px-2">
                    <div className={`text-sm font-bold ${row.valColor} tracking-tight`}>{row.value}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{row.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Identificador único</span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{brokerId || "OFFLINE_MODE"}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white text-[11px] font-bold uppercase tracking-widest rounded hover:bg-slate-900 transition-all shadow-sm active:scale-95"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
}
