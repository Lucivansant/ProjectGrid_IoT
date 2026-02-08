import React, { useState, useEffect } from "react";
import { DeviceModal } from "./DeviceModal";
import { DeviceRow } from "./DeviceRow";
import { Search } from "lucide-react";

// Reutilizamos a interface do DiscoveryGrid para consistência
export interface DiscoveredDevice {
  topic: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastPayload: any;
  lastSeen: number;
  messageCount: number;
}

interface DevicesTableProps {
  devices: DiscoveredDevice[];
}

export function DevicesTable({ devices }: DevicesTableProps) {
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDevices = devices.filter((device) =>
    device.topic.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500 flex flex-col h-[700px]">
        {/* Header da Tabela com Busca */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar dispositivo..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Mostrando {filteredDevices.length} dispositivos
          </div>
        </div>

        {/* Header Fixo GRID */}
        <div className="grid grid-cols-12 bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold shrink-0">
          <div className="col-span-4 px-4 py-3 pl-6">Dispositivo / Tópico</div>
          <div className="col-span-2 px-2 py-3 text-center">Status</div>
          <div className="col-span-2 px-2 py-3">Tendência (15pt)</div>
          <div className="col-span-3 px-2 py-3">Último Dado</div>
          <div className="col-span-1 px-4 py-3 text-right">Ações</div>
        </div>

        {/* Corpo Scrollável (Padrão HTML - Infalível) */}
        <div className="flex-1 overflow-auto bg-white min-h-0 relative">
          {filteredDevices.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {filteredDevices.map((device) => (
                <DeviceRow
                  key={device.topic}
                  device={device}
                  currentTime={now}
                  onSelect={setSelectedDevice}
                  // style prop não é necessária no modo padrão
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Search size={32} className="mb-2 opacity-20" />
              <p className="text-sm">Nenhum dispositivo encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {selectedDevice && (
        <DeviceModal
          isOpen={true}
          onClose={() => setSelectedDevice(null)}
          topic={selectedDevice.topic}
          lastPayload={selectedDevice.lastPayload}
        />
      )}
    </>
  );
}
