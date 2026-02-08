import React, { useEffect, useState } from "react";
import { db } from "../../../_lib/db/LocalDatabase";
import { Database, Trash2, Clock } from "lucide-react";

interface StorageStatusWidgetProps {
  brokerId: string;
  onClearComplete: () => void;
}

interface StorageStats {
  recordCount: number;
  usageBytes: number;
  quotaBytes: number;
  estimatedDaysLeft: string;
}

export function StorageStatusWidget({
  brokerId,
  onClearComplete,
}: StorageStatusWidgetProps) {
  const [stats, setStats] = useState<StorageStats>({
    recordCount: 0,
    usageBytes: 0,
    quotaBytes: 0,
    estimatedDaysLeft: "---",
  });

  const [loading, setLoading] = useState(false);

  const updateStats = async () => {
    try {
      // 1. Contagem de registros no Dexie APENAS para este broker
      const count = await db.messages
        .where("brokerId")
        .equals(brokerId)
        .count();

      // 2. Estimativa de Quota REAL do navegador (Limite Físico)
      let quota = 0;
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || 0;
      }

      // 3. Cálculo de Uso ESPECÍFICO deste broker (Estimativa por Amostragem)
      let usage = 0;
      let estimatedDaysLeft = "---";

      if (count > 0) {
        // Pega uma amostra das últimas 50 mensagens para calcular tamanho médio
        const sampleMsgs = await db.messages
          .where("brokerId")
          .equals(brokerId)
          .reverse()
          .limit(50)
          .toArray();

        if (sampleMsgs.length > 0) {
          // Calcula tamanho aproximado em bytes da amostra (JSON stringified)
          const sampleSize = sampleMsgs.reduce(
            (acc, msg) => acc + JSON.stringify(msg).length,
            0,
          );
          const avgBytesPerMsg = sampleSize / sampleMsgs.length;

          // Uso Estimado = Média * Total
          usage = avgBytesPerMsg * count;

          // --- Lógica de Predição Temporal ---
          if (count > 5) {
            // Buscamos o registro mais antigo disponível no banco para calcular a taxa de ingestão de longo prazo
            const oldestMsg = await db.messages
              .where("brokerId")
              .equals(brokerId)
              .limit(1)
              .first();
            // O mais recente é o primeiro da amostra reversa
            const newestMsg = sampleMsgs[0];

            if (oldestMsg && newestMsg) {
              const timeSpanMs = newestMsg.timestamp - oldestMsg.timestamp;
              if (timeSpanMs > 5000) {
                // Precisa de pelo menos 30s de histórico

                // Taxa de crescimento: Bytes por ms
                // Consideramos que TODO o uso atual foi gerado nesse intervalo de tempo (aproximação)
                const bytesPerMs = usage / timeSpanMs;

                const freeBytes = quota - usage; // Espaço restante no disco

                if (bytesPerMs > 0) {
                  const msLeft = freeBytes / bytesPerMs;
                  const days = msLeft / (1000 * 60 * 60 * 24);

                  if (days > 365) estimatedDaysLeft = "> 1 ano";
                  else if (days > 30)
                    estimatedDaysLeft = `~${(days / 30).toFixed(1)} meses`;
                  else if (days < 1)
                    estimatedDaysLeft = `~${(msLeft / (1000 * 60 * 60)).toFixed(1)} h`;
                  else estimatedDaysLeft = `~${days.toFixed(1)} dias`;
                }
              }
            }
          }
        }
      }

      setStats({
        recordCount: count,
        usageBytes: usage,
        quotaBytes: quota,
        estimatedDaysLeft,
      });
    } catch (error) {
      console.error("Erro ao ler stats de armazenamento:", error);
    }
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [brokerId]);

  const handleClearStorage = async () => {
    if (!confirm("Tem certeza? Isso apagará o histórico APENAS deste broker."))
      return;

    setLoading(true);
    try {
      await db.messages.where("brokerId").equals(brokerId).delete();
      await updateStats();
      onClearComplete();
    } catch (error) {
      console.error("Erro ao limpar banco:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const usagePercent =
    stats.quotaBytes > 0
      ? ((stats.usageBytes / stats.quotaBytes) * 100).toFixed(1)
      : "0";

  const avgBytesPerRecord =
    stats.recordCount > 0 && stats.usageBytes > 0
      ? stats.usageBytes / stats.recordCount
      : 500;

  const freeBytes = stats.quotaBytes - stats.usageBytes;
  const estimatedRecordsLeft = Math.floor(freeBytes / avgBytesPerRecord);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:flex-1 transition-all">
      {/* Ícone e Contagem Principal */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shadow-sm">
          <Database size={22} />
        </div>
        <div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
            Armazenamento Local
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-800">
              {stats.recordCount}
            </span>
            <span className="text-xs text-gray-500 font-medium">registros</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-100 whitespace-nowrap">
              +{" "}
              {estimatedRecordsLeft > 1000000
                ? `${(estimatedRecordsLeft / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}M`
                : estimatedRecordsLeft.toLocaleString("pt-BR")}{" "}
              msgs
            </span>
          </div>
        </div>
      </div>

      <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>

      {/* Barra de Progresso e Estimativa */}
      <div className="w-full sm:flex-1 min-w-[200px]">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-700">
              {formatBytes(stats.usageBytes)}
            </span>
            <span className="text-gray-400">
              usados de {formatBytes(stats.quotaBytes)}
            </span>
          </div>
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 rounded">
            {usagePercent}%
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${Number(usagePercent) > 90 ? "bg-red-500" : "bg-purple-500"}`}
            style={{ width: `${Math.max(Number(usagePercent), 2)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-500">
          <span>~{Math.round(avgBytesPerRecord)} B/msg</span>
          {stats.estimatedDaysLeft !== "---" ? (
            <div className="flex items-center gap-1 text-blue-600 font-medium animate-pulse">
              <Clock size={12} />
              <span>Cheio em {stats.estimatedDaysLeft}</span>
            </div>
          ) : (
            <span>Calculando tempo...</span>
          )}
        </div>
      </div>

      {/* Botão de Ação */}
      <button
        onClick={handleClearStorage}
        disabled={loading || stats.recordCount === 0}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent ml-auto sm:ml-0 flex items-center gap-2"
        title="Limpar Histórico"
      >
        <span className="text-xs font-medium sm:hidden">Limpar</span>
        <Trash2 size={18} />
      </button>
    </div>
  );
}
