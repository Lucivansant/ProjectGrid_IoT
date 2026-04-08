/**
 * Componente de Resumo de Armazenamento.
 * Exibe métricas sobre a utilização do banco de dados local (IndexedDB)
 * e o status atual da conexão com o broker MQTT selecionado.
 */
"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../_lib/db/LocalDatabase";
import { HardDrive, Cpu, Wifi, WifiOff, Loader2 } from "lucide-react";

interface StorageSummaryCardProps {
  brokerId: string;
  deviceCount: number;
  isConnected: boolean;
  connectionError?: string | null;
  brokerChange?: string; // "Estável", mensagem de erro, etc.
}

/** Retorna o número formatado E o rótulo da escala separados para exibição enfatizada */
/**
 * Formata números grandes em uma estrutura de valor e rótulo (ex: 1.5 milhões).
 * Facilita a exibição de métricas de alta escala no dashboard.
 */
function formatSplit(n: number): { value: string; label: string } {
  if (n >= 1_000_000) return {
    value: (n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
    label: "milhões",
  };
  if (n >= 1_000) return {
    value: (n / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
    label: "mil",
  };
  if (n >= 100) return { value: n.toLocaleString("pt-BR"), label: "centenas" };
  return { value: n.toLocaleString("pt-BR"), label: "" };
}

/** Formata bytes em unidade legível */
/**
 * Converte bytes em uma string legível (B, KB, MB, GB).
 */
function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Exibe um card com o resumo do armazenamento local e estatísticas do dispositivo.
 * Inclui uma barra de progresso para a cota de armazenamento disponível no navegador.
 */
export function StorageSummaryCard({
  brokerId,
  deviceCount,
  isConnected,
  connectionError,
  brokerChange,
}: StorageSummaryCardProps) {
  const [recordCount, setRecordCount] = useState(0);
  const [usageBytes, setUsageBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState(0);

  useEffect(() => {
    if (!brokerId) return;

    const update = async () => {
      try {
        const count = await db.messages.where("brokerId").equals(brokerId).count();

        const TWO_GB = 2 * 1024 * 1024 * 1024;
        let quota = TWO_GB;
        if (navigator.storage?.estimate) {
          const est = await navigator.storage.estimate();
          const browserQuota = est.quota ?? 0;
          quota = Math.min(browserQuota, TWO_GB);
        }

        let usage = 0;
        if (count > 0) {
          const sample = await db.messages
            .where("brokerId").equals(brokerId)
            .reverse().limit(50).toArray();
          if (sample.length > 0) {
            const totalSize = sample.reduce((acc, m) => acc + JSON.stringify(m).length, 0);
            usage = (totalSize / sample.length) * count;
          }
        }

        setRecordCount(count);
        setUsageBytes(usage);
        setQuotaBytes(quota);
      } catch { /* silent */ }
    };

    update();
    const iv = setInterval(update, 5000);
    return () => clearInterval(iv);
  }, [brokerId]);

  const usedPct = quotaBytes > 0 ? Math.min((usageBytes / quotaBytes) * 100, 100) : 0;
  const barColor = usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-amber-400" : "bg-emerald-500";

  const avgBytesPerRecord = recordCount > 0 && usageBytes > 0 ? usageBytes / recordCount : 500;
  const freeBytes = quotaBytes - usageBytes;
  const estimatedRecordsLeft = Math.max(Math.floor(freeBytes / avgBytesPerRecord), 0);

  // ── Status do broker ──────────────────────────────────────────────
  const isConnecting = !isConnected && !connectionError;
  const statusLabel = isConnected ? "Online" : connectionError ? "Falha" : "Conectando...";
  const statusColor = isConnected
    ? { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-50", border: "border-green-100" }
    : connectionError
    ? { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50", border: "border-red-100" }
    : { dot: "bg-yellow-400", text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" };

  return (
    <div className="h-full flex flex-col justify-between gap-3">

      {/* ── Linha superior: título + badge de status do broker ──────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
            <HardDrive size={18} className="text-indigo-500" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Resumo Local
          </span>
        </div>

        {/* Badge integrado de status do broker */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}
        >
          {isConnecting ? (
            <Loader2 size={11} className="animate-spin" />
          ) : isConnected ? (
            <Wifi size={11} />
          ) : (
            <WifiOff size={11} />
          )}
          <span>{statusLabel}</span>
          {brokerChange && isConnected && (
            <span className="text-[10px] font-normal opacity-70">· {brokerChange}</span>
          )}
        </div>
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Dispositivos */}
        <div className="bg-blue-50 rounded-xl p-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Cpu size={13} className="text-blue-500 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">
              Dispositivos
            </span>
          </div>
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-2xl font-extrabold text-blue-700">
              {formatSplit(deviceCount).value}
            </span>
            {formatSplit(deviceCount).label && (
              <span className="text-sm font-bold text-blue-400">
                {formatSplit(deviceCount).label}
              </span>
            )}
          </div>
          <span className="text-[10px] text-blue-400 mt-0.5">tópicos ativos</span>
        </div>

        {/* Registros */}
        <div className="bg-purple-50 rounded-xl p-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 mb-1">
            <HardDrive size={13} className="text-purple-500 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide">
              Registros
            </span>
          </div>
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-2xl font-extrabold text-purple-700">
              {formatSplit(recordCount).value}
            </span>
            {formatSplit(recordCount).label && (
              <span className="text-sm font-bold text-purple-400">
                {formatSplit(recordCount).label}
              </span>
            )}
          </div>
          <span className="text-[10px] text-purple-400 mt-0.5">
            {formatBytes(usageBytes)} salvos
          </span>
          {/* Capacidade restante */}
          {estimatedRecordsLeft > 0 && (() => {
            const { value, label } = formatSplit(estimatedRecordsLeft);
            return (
              <div className="mt-1.5 bg-green-50 border border-green-100 rounded-lg px-2 py-1.5 flex flex-col gap-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-extrabold text-green-700 leading-none">+ {value}</span>
                  {label && (
                    <span className="text-xs font-bold text-green-500">{label}</span>
                  )}
                </div>
                <span className="text-[10px] text-green-500 font-medium">capacidade de mensagens</span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Barra de capacidade ── */}
      <div>
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>{formatBytes(usageBytes)} usados</span>
          <span>{formatBytes(quotaBytes)} total</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${Math.max(usedPct, 1.5)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
