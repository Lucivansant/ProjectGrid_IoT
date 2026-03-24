"use client";
import React, { useEffect, useRef, useReducer, useMemo } from "react";
import { Clock } from "lucide-react";

interface LastReadCardProps {
  lastTimestamp: number | null;
}

const MAX_BARS = 28;

// ── Reducer (sem setState avulso em effects) ──────────────────────────────
type State = { history: number[]; pulse: boolean };
type Action =
  | { type: "ADD_TS"; ts: number }
  | { type: "PULSE_OFF" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TS": {
      const next = [...state.history, action.ts];
      return {
        history: next.length > MAX_BARS + 1 ? next.slice(-(MAX_BARS + 1)) : next,
        pulse: true,
      };
    }
    case "PULSE_OFF":
      return { ...state, pulse: false };
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────
export function LastReadCard({ lastTimestamp }: LastReadCardProps) {
  const [{ history, pulse }, dispatch] = useReducer(reducer, {
    history: [],
    pulse: false,
  });

  const prevTsRef = useRef<number | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastTimestamp || lastTimestamp === prevTsRef.current) return;
    prevTsRef.current = lastTimestamp;

    dispatch({ type: "ADD_TS", ts: lastTimestamp });

    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(
      () => dispatch({ type: "PULSE_OFF" }),
      700
    );

    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, [lastTimestamp]);

  // ── Deltas entre msgs consecutivas ──
  const deltas = useMemo(() => {
    const d: number[] = [];
    for (let i = 1; i < history.length; i++) d.push(history[i] - history[i - 1]);
    return d;
  }, [history]);

  // Normaliza: delta pequeno → barra alta
  const bars = useMemo(() => {
    if (deltas.length === 0) return [];
    const maxD = Math.max(...deltas, 1);
    const minD = Math.min(...deltas, maxD);
    const range = maxD - minD || 1;
    return deltas.map((d) => Math.max(0.08, 1 - (d - minD) / range));
  }, [deltas]);

  const padded = [
    ...Array(Math.max(0, MAX_BARS - bars.length)).fill(0),
    ...bars,
  ];

  const hasData = history.length > 1;

  const timeStr = lastTimestamp
    ? new Date(lastTimestamp).toLocaleTimeString("pt-BR")
    : "--:--:--";

  // Taxa: msgs/min com base nos últimos 5 deltas
  const recentDeltas = deltas.slice(-5);
  const avgDelta =
    recentDeltas.length > 0
      ? recentDeltas.reduce((a, b) => a + b, 0) / recentDeltas.length
      : null;
  const msgsPerMin =
    avgDelta && avgDelta > 0 ? Math.round(60_000 / avgDelta) : null;
  const lastDelta = deltas.length > 0 ? deltas[deltas.length - 1] : null;

  return (
    <div className="h-full flex flex-col justify-between gap-2">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
            pulse
              ? "bg-blue-200 scale-110 shadow-md shadow-blue-200"
              : "bg-blue-50"
          }`}
        >
          <Clock
            size={20}
            className={`transition-colors duration-300 ${
              pulse ? "text-blue-700" : "text-blue-500"
            }`}
          />
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
          <span>Tempo Real</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
      </div>

      {/* ── Horário ── */}
      <div>
        <h3
          className={`text-xl font-bold transition-colors duration-200 ${
            pulse ? "text-blue-600" : "text-gray-900"
          }`}
        >
          {timeStr}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-gray-500 text-sm">Última Leitura</p>
          {msgsPerMin !== null && (
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">
              ~{msgsPerMin} msg/min
            </span>
          )}
        </div>
      </div>

      {/* ── Sparkline ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-end gap-[2.5px] h-12 w-full">
          {padded.map((h, i) => {
            const isLast = i === padded.length - 1;
            const isRecent = i >= padded.length - 4;
            const isEmpty = h === 0;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-[2px] transition-all duration-500 ${
                  isEmpty
                    ? hasData
                      ? "bg-gray-100"
                      : "bg-gray-100 animate-pulse"
                    : isLast
                    ? "bg-blue-500 shadow-sm shadow-blue-300"
                    : isRecent
                    ? "bg-blue-400"
                    : "bg-blue-200"
                }`}
                style={{
                  height: isEmpty
                    ? hasData
                      ? "8%"
                      : `${12 + Math.sin(i * 0.6) * 6}%`
                    : `${Math.round(Math.max(h * 100, 10))}%`,
                  animationDelay:
                    isEmpty && !hasData ? `${i * 40}ms` : undefined,
                }}
              />
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex justify-between items-center text-[10px] text-gray-400">
          <span>
            {hasData
              ? `${history.length} msgs recebidas`
              : "Aguardando dados..."}
          </span>
          {lastDelta !== null && (
            <span>
              intervalo:{" "}
              {lastDelta < 1000
                ? `${lastDelta}ms`
                : `${(lastDelta / 1000).toFixed(1)}s`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
