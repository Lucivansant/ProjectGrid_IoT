/**
 * Tabela de Dados em Tempo Real.
 * Exibe as métricas de sensores do último payload recebido em uma
 * estrutura de tabela simples com chave e valor, útil para monitoramento imediato.
 */
"use client";
import React from "react";
import { Database, Activity } from "lucide-react";
import {
  SensorData,
  JsonValue,
} from "../../../_lib/services/UniversalMqttClient";

interface LiveDataTableProps {
  data: SensorData | null;
}

/**
 * Renderiza uma tabela dinâmica com os sensores do último payload.
 */
export function LiveDataTable({ data }: LiveDataTableProps) {
  // Função recursiva para achatar o objeto JSON (flatten) se necessário,
  // ou apenas extrair chaves de primeiro nível.
  // Para visualização "mastigada", vamos focar em sensores conhecidos.

  /**
   * Converte qualquer tipo de valor JSON em uma string segura para exibição.
   */
  const safeStringify = (val: JsonValue): string => {
    if (typeof val === "object" && val !== null) return JSON.stringify(val);
    return String(val);
  };

  /**
   * Mapeia as entradas do payload para elementos de linha da tabela.
   */
  const renderRows = () => {
    if (!data || !data.sensors) {
      return (
        <tr>
          <td
            colSpan={2}
            className="px-6 py-8 text-center text-gray-400 italic"
          >
            Nenhum dado estruturado recebido
          </td>
        </tr>
      );
    }

    // Assume-se que 'sensors' é um objeto chave-valor
    return Object.entries(data.sensors).map(([key, value]) => (
      <tr
        key={key}
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <td className="px-6 py-4 font-medium text-gray-700 capitalize flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          {key}
        </td>
        <td className="px-6 py-4 text-gray-900 font-bold font-mono text-right">
          {safeStringify(value)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50 rounded-t-xl">
        <Database className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-gray-800">Dados em Tempo Real</h3>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">
                Variável
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Valor Atual
              </th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      {data && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>Última atualização:</span>
          <span className="font-mono">
            {data.timestamp
              ? new Date(data.timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
