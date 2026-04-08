/**
 * Interface principal do Dashboard do ProjectGrid.
 * Este arquivo gerencia a conexão MQTT, a troca de brokers e orquestra
 * todos os componentes de visualização de dados em tempo real.
 */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useMqtt } from "../../_lib/hooks/useMqtt";
import { useBrokerConfigs } from "../../_lib/hooks/useBrokerConfigs";
import { BrokerConfigPublic, getBrokerSecret } from "../../_lib/actions/brokerActions";

// Importando Componentes Refatorados
import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";
import { StatsGrid } from "./Stats/StatsGrid";
import { BrokerConfigForm } from "./Config/broker-config-form";
import { DiscoveryGrid } from "./Discovery/DiscoveryGrid";
import { ReliabilityGauge } from "./Stats/ReliabilityGauge";
import { StorageSummaryCard } from "./Stats/StorageSummaryCard";
import { LastReadCard } from "./Stats/LastReadCard";
import { StorageStatsModal } from "./Stats/StorageStatsModal";

interface DashboardClientProps {
  initialBrokers: BrokerConfigPublic[];
}

/**
 * Componente principal do Client do Dashboard.
 * Gerencia o estado global da visualização, conexão MQTT e navegação interna.
 */
export function DashboardClient({ initialBrokers }: DashboardClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [user] = useState<{ id: string; email?: string } | null>({ id: "demo-user", email: "demo@example.com" });
  const [loading, setLoading] = useState(false);
  
  const { brokers } = useBrokerConfigs(initialBrokers);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>("");
  const [deviceCount, setDeviceCount] = useState(0);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isStorageExceeded, setIsStorageExceeded] = useState(false);

  // Monitor de Armazenamento (Trava de Segurança)
  useEffect(() => {
    const checkStorage = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        const TWO_GB = 2 * 1024 * 1024 * 1024;
        const currentQuota = Math.min(quota || 0, TWO_GB);
        
        // Se usar mais de 98% dos 2GB, bloqueia.
        if (usage && usage >= currentQuota * 0.98) {
          setIsStorageExceeded(true);
          setMqttConnectConfig(undefined); // DESCONECTA O MQTT
        } else {
          setIsStorageExceeded(false);
        }
      }
    };

    checkStorage();
    const interval = setInterval(checkStorage, 10000);
    return () => clearInterval(interval);
  }, []);

  // Conexão MQTT Ativa
  const [mqttConnectConfig, setMqttConnectConfig] = useState<{
    brokerUrl: string;
    username?: string;
    password?: string;
    clientId: string;
  } | undefined>(undefined);

  // Estado para controlar qual tópico estamos ouvindo
  const [activeTopic] = useState("projectgrid/#");

  // Hook MQTT
  const {
    isConnected,
    connectionError,
    data: mqttData,
    publishMessage,
  } = useMqtt(activeTopic, mqttConnectConfig);

  // Função para trocar de Broker - Agora carrega segredos sob demanda
  /**
   * Gerencia a troca de broker MQTT ativo.
   * Busca as credenciais de segurança e formata a URL de conexão antes de atualizar o estado.
   */
  const handleBrokerChange = useCallback(async (brokerId: string, list: BrokerConfigPublic[] = brokers) => {
    const selected = list.find((b) => b.id === brokerId);
    if (selected) {
      setSelectedBrokerId(brokerId);
      setLoading(true);

      try {
        // Busca segredos apenas quando for conectar
        const secrets = await getBrokerSecret(brokerId);

        // Normalização Robusta da URL
        let url = selected.broker_url.trim();
        if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
            const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
            url = `${isLocal ? "ws" : "wss"}://${url}`;
        }
        const portPattern = /:\d+(\/|$)/;
        if (!portPattern.test(url) && selected.port) {
            if (url.endsWith("/")) url = url.slice(0, -1);
            url = `${url}:${selected.port}`;
        }
        if (!url.includes("/mqtt") && !url.endsWith("/mqtt")) {
            if (!url.endsWith("/")) url += "/";
            url += "mqtt";
        }

        setMqttConnectConfig({
            brokerUrl: url,
            username: secrets?.username ?? undefined,
            password: secrets?.password ?? undefined,
            clientId: `projectgrid_${brokerId.split("-")[0] || "web"}`,
        });
      } catch (err) {
        console.error("Erro ao obter credenciais:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [brokers]);

  // Carregamento inicial automático
  useEffect(() => {
    if (brokers.length > 0 && !selectedBrokerId && !mqttConnectConfig) {
      handleBrokerChange(brokers[0].id, brokers);
    }
  }, [brokers, selectedBrokerId, mqttConnectConfig, handleBrokerChange]);

  // Handler de Logout
  /**
   * Executa o processo de logout, limpando dados locais e redirecionando para o login.
   */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const statsData = [
    {
      title: "Resumo Local",
      onClick: () => setShowStatsModal(true),
      customContent: (
        <StorageSummaryCard
          brokerId={selectedBrokerId}
          deviceCount={deviceCount}
          isConnected={!!isConnected}
          connectionError={connectionError}
          brokerChange={isConnected ? "Estável" : undefined}
        />
      ),
    },
    {
      title: "Última Leitura",
      customContent: (
        <LastReadCard lastTimestamp={mqttData?.timestamp ?? null} />
      ),
    },
    {
      title: "Confiabilidade",
      customContent: (
        <ReliabilityGauge
          isConnected={!!isConnected}
          lastActivity={mqttData?.timestamp || 0}
        />
      ),
    },
  ];

  /**
   * Determina qual conteúdo principal renderizar com base na navegação da sidebar.
   */
  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return (
          <div className="flex flex-col h-full gap-0">
            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Monitoramento em Tempo Real</h1>
                <p className="text-sm text-gray-600">Visualize os dados brutos chegando do seu dispositivo MQTT.</p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">Broker:</span>
                <select
                  value={selectedBrokerId}
                  onChange={(e) => handleBrokerChange(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none min-w-[200px]"
                >
                  {brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.name || "Sem Nome"} ({broker.broker_url.replace(/^wss?:\/\//, "").split("/")[0]})
                    </option>
                  ))}
                  {brokers.length === 0 && <option value="">Nenhum Broker Configurado</option>}
                </select>

                <button
                  type="button"
                  disabled={!isConnected}
                  onClick={() => publishMessage("projectgrid/test", { timestamp: Date.now(), sensor: "Conexão OK!" })}
                  className={`ml-2 px-3 py-2 rounded text-xs font-bold transition-colors flex items-center gap-1 ${isConnected ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200" : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"}`}
                >
                  📡 Testar
                </button>
              </div>
            </div>

            <div className="shrink-0">
              <StatsGrid stats={statsData} />
            </div>

            {isStorageExceeded && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 shrink-0 animate-bounce">
                <div className="text-amber-500 mt-1">🛑</div>
                <div>
                  <h3 className="text-sm font-bold text-amber-800">Conexão Suspensa por Segurança</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Seu limite de 2GB de histórico foi atingido. Para continuar recebendo dados, limpe o histórico no widget de armazenamento abaixo.
                  </p>
                </div>
              </div>
            )}

            {connectionError && !isStorageExceeded && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 shrink-0">
                <div className="text-red-500 mt-1">⚠️</div>
                <div>
                  <h3 className="text-sm font-bold text-red-800">Falha na Conexão MQTT</h3>
                  <p className="text-sm text-red-700 font-mono mt-1 mb-2">{connectionError}</p>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-hidden">
              <DiscoveryGrid
                currentData={mqttData}
                currentTopic={mqttData?.topic || "Desconhecido"}
                brokerId={selectedBrokerId}
                onDeviceCountChange={setDeviceCount}
              />
            </div>
          </div>
        );
      case "config":
        return (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h1>
              <p className="text-sm text-gray-600">Gerencie sua conexão MQTT e preferências</p>
            </div>
            <div className="w-full">
              <BrokerConfigForm />
            </div>
          </>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
            <p className="text-lg font-medium">Em desenvolvimento</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          onLogout={handleLogout}
        />
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden px-4 py-6 flex flex-col">
            {loading
              ? <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
              : renderContent()
            }
          </div>
        </main>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Modais Globais */}
      {showStatsModal && (
        <StorageStatsModal
          brokerId={selectedBrokerId}
          deviceCount={deviceCount}
          isConnected={!!isConnected}
          connectionError={connectionError}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
}
