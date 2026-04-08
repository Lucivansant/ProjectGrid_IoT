/**
 * Widget de Status de Armazenamento.
 * Exibe estatísticas detalhadas sobre o uso do banco de dados local,
 * incluindo previsões de quanto tempo o espaço durará e opção de limpeza.
 */
import React, { useEffect, useState } from "react";
import { db } from "../../../_lib/db/LocalDatabase";
import { Trash2, Clock, AlertTriangle } from "lucide-react";

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

/* ─── Modal de Confirmação ─────────────────────────────────────────── */
/**
 * Modal de diálogo interno para confirmação de exclusão de dados.
 */
function ConfirmModal({
  open,
  recordCount,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  recordCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5 animate-[fadeInScale_0.18s_ease]"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "fadeInScale 0.18s cubic-bezier(.4,0,.2,1) both",
        }}
      >
        {/* Ícone */}
        <div className="flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
        </div>

        {/* Texto */}
        <div className="text-center">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            Limpar histórico?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Isso irá apagar permanentemente{" "}
            <span className="font-semibold text-gray-700">
              {recordCount.toLocaleString("pt-BR")} registro
              {recordCount !== 1 ? "s" : ""}
            </span>{" "}
            <span className="text-red-500 font-medium">apenas deste broker</span>.
            Esta ação não pode ser desfeita.
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-sm font-semibold text-white transition-all shadow-sm"
          >
            Sim, limpar
          </button>
        </div>
      </div>

      {/* Keyframe embutido via style tag */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

/* ─── Widget Principal ─────────────────────────────────────────────── */
/**
 * Exibe estatísticas de uso de banco e previsão de capacidade.
 */
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
  const [showConfirm, setShowConfirm] = useState(false);

  /**
   * Recalcula estatísticas de uso e faz predições temporais.
   */
  const updateStats = React.useCallback(async () => {
    try {
      // 1. Contagem de registros no Dexie APENAS para este broker
      const count = await db.messages
        .where("brokerId")
        .equals(brokerId)
        .count();

      // 2. Limite de Quota: Usamos 2GB como limite padrão sugerido (ou o real do browser, se for menor)
      const TWO_GB = 2 * 1024 * 1024 * 1024;
      let quota = TWO_GB;
      
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const browserQuota = estimate.quota || 0;
        // Se o browser permitir menos que 2GB, usamos o limite do browser. Se não, travamos em 2GB.
        quota = Math.min(browserQuota, TWO_GB);
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
            const oldestMsg = await db.messages
              .where("brokerId")
              .equals(brokerId)
              .limit(1)
              .first();
            const newestMsg = sampleMsgs[0];

            if (oldestMsg && newestMsg) {
              const timeSpanMs = newestMsg.timestamp - oldestMsg.timestamp;
              if (timeSpanMs > 5000) {
                const bytesPerMs = usage / timeSpanMs;
                const freeBytes = quota - usage;

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
  }, [brokerId]);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [brokerId, updateStats]);

  /**
   * Remove registros do broker atual do banco local.
   */
  const handleClearStorage = async () => {
    setLoading(true);
    setShowConfirm(false);
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

  return (
    <>
      {/* Modal de confirmação customizado */}
      <ConfirmModal
        open={showConfirm}
        recordCount={stats.recordCount}
        onConfirm={handleClearStorage}
        onCancel={() => setShowConfirm(false)}
      />

      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex flex-row items-center gap-4 w-full lg:flex-1 transition-all">
        {/* Barra de Progresso e Estimativa */}
        <div className="flex-1 min-w-0">
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
          onClick={() => setShowConfirm(true)}
          disabled={loading || stats.recordCount === 0}
          className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Limpar Histórico"
        >
          <Trash2 size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
    </>
  );

}
