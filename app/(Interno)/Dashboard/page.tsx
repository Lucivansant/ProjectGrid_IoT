"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMqtt } from "../_lib/hooks/useMqtt";
import { createClient, User } from "@supabase/supabase-js";
import { AuthStorage } from "@/app/login/autentica/AuthStorage";

// Importando Componentes Refatorados
import { Header } from "./Components/Header/Header";
import { Sidebar } from "./Components/Sidebar/Sidebar";
import { StatsGrid } from "./Components/Stats/StatsGrid";
import { BrokerConfigForm } from "./Components/Config/broker-config-form";
import { DiscoveryGrid } from "./Components/Discovery/DiscoveryGrid";
import { ReliabilityGauge } from "./Components/Stats/ReliabilityGauge";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Multi-Broker States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [brokers, setBrokers] = useState<any[]>([]); // Lista de todos os brokers
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>("");

  // Conexão MQTT Ativa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mqttConnectConfig, setMqttConnectConfig] = useState<any>(undefined);

  // Estado para controlar qual tópico estamos ouvindo (Seleção de Dispositivo ou 'projectgrid/test')
  // No modo Discovery, assinamos TUDO (#)
  const [activeTopic] = useState("projectgrid/#");

  // Hook MQTT conecta no broker selecionado e ouve o tópico ativo
  const {
    isConnected,
    connectionError,
    data: mqttData,
    publishMessage,
  } = useMqtt(activeTopic, mqttConnectConfig);

  // Função para trocar de Broker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBrokerChange = (brokerId: string, list: any[] = brokers) => {
    const selected = list.find((b) => b.id === brokerId);
    if (selected) {
      setSelectedBrokerId(brokerId);

      // Normalização Robusta da URL
      let url = selected.broker_url.trim();

      // 1. Protocolo Default
      if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
        const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
        url = `${isLocal ? "ws" : "wss"}://${url}`;
      }

      // 2. Garante Porta
      const portPattern = /:\d+(\/|$)/;
      if (!portPattern.test(url) && selected.port) {
        if (url.endsWith("/")) url = url.slice(0, -1);
        url = `${url}:${selected.port}`;
      }

      // 3. Garante Path /mqtt
      if (!url.includes("/mqtt") && !url.endsWith("/mqtt")) {
        if (!url.endsWith("/")) url += "/";
        url += "mqtt";
      }

      console.log("🔗 Connecting to:", url);

      setMqttConnectConfig({
        brokerUrl: url,
        username: selected.username,
        password: selected.password,
        // Client ID fixo por Broker para evitar múltiplas sessões zumbis
        // O Broker derruba a anterior automaticamente se o ID for igual
        clientId: `projectgrid_${brokerId.split("-")[0] || "web"}`,
      });
    }
  };

  // Autenticação e Carregamento de Configurações
  useEffect(() => {
    const initData = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // 1. Verifica Usuário
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.log("Usuário não autenticado, redirecionando...");
        router.push("/login");
        return;
      }

      setUser(user);

      // 2. Busca TODOS os Brokers do usuário
      const { data: brokersList } = await supabase
        .from("broker_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (brokersList && brokersList.length > 0) {
        setBrokers(brokersList);
        // Seleciona o primeiro por padrão
        handleBrokerChange(brokersList[0].id, brokersList);
      }

      setLoading(false);
    };

    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Handler de Logout
  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    AuthStorage.clear();
    localStorage.clear();
    window.location.href = "/login";
  };

  // Montagem dos Dados do Dashboard (Lógica de Negócio)
  // Aqui transformamos o estado técnico (MQTT) em estado visual (Cards)

  // ... (dentro do componente Dashboard)

  // Montagem dos Dados do Dashboard (Lógica de Negócio)
  const statsData = [
    {
      title: "Status do Broker",
      value: isConnected
        ? "Online"
        : connectionError
          ? "Falha"
          : "Conectando...",
      change: isConnected ? "Estável" : connectionError || "...",
      changeType: (isConnected
        ? "positive"
        : connectionError
          ? "negative"
          : "warning") as "positive" | "negative" | "warning",
      icon: "M13 10V3L4 14h7v7l9-11h-7z", // Raio
      color: (isConnected ? "green" : connectionError ? "red" : "gray") as
        | "green"
        | "red"
        | "gray",
    },
    {
      title: "Última Leitura",
      value: mqttData
        ? new Date(mqttData.timestamp).toLocaleTimeString()
        : "--:--",
      change: "Tempo Real",
      changeType: "positive",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", // Relógio
      color: "blue",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Renderização Condicional do Conteúdo
  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return (
          <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Monitoramento em Tempo Real
                </h1>
                <p className="text-sm text-gray-600">
                  Visualize os dados brutos chegando do seu dispositivo MQTT.
                </p>
              </div>

              {/* Seletor de Broker */}
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-2">
                  Broker:
                </span>
                <select
                  value={selectedBrokerId}
                  onChange={(e) => handleBrokerChange(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none min-w-[200px]"
                >
                  {brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.name || "Sem Nome"} (
                      {
                        broker.broker_url
                          .replace(/^wss?:\/\//, "")
                          .split("/")[0]
                      }
                      )
                    </option>
                  ))}
                  {brokers.length === 0 && (
                    <option value="">Nenhum Broker Configurado</option>
                  )}
                </select>

                <button
                  type="button"
                  disabled={!isConnected}
                  onClick={() => {
                    const testMsg = {
                      timestamp: Date.now(),
                      sensor: "Conexão OK!",
                    };
                    publishMessage("projectgrid/test", testMsg);
                  }}
                  className={`ml-2 px-3 py-2 rounded text-xs font-bold transition-colors flex items-center gap-1 ${isConnected ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200" : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"}`}
                  title="Envia uma mensagem de teste para verificar a comunicação"
                >
                  📡 Testar
                </button>
              </div>
            </div>

            <StatsGrid stats={statsData} />

            {/* Diagnóstico de Erro de Conexão */}
            {connectionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <div className="text-red-500 mt-1">⚠️</div>
                <div>
                  <h3 className="text-sm font-bold text-red-800">
                    Falha na Conexão MQTT
                  </h3>
                  <p className="text-sm text-red-700 font-mono mt-1 mb-2">
                    {connectionError}
                  </p>
                  <div className="text-xs text-red-600 space-y-1">
                    <p>
                      <strong>Possíveis Soluções:</strong>
                    </p>
                    <ul className="list-disc pl-4">
                      <li>
                        <strong>EMQX Serverless:</strong> Você criou um Usuário
                        e Senha na aba <em>Authentication</em> do painel do
                        EMQX? (Não é o login do site, é no menu lateral do
                        broker).
                      </li>
                      <li>
                        <strong>Porta:</strong> Para navegadores, você DEVE usar
                        a porta <strong>8084</strong> (WSS) ou 8083 (WS). A
                        porta 8883 não funciona aqui.
                      </li>
                      <li>
                        <strong>URL:</strong> O endereço deve começar com{" "}
                        <code>wss://</code> e terminar com <code>/mqtt</code>.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MqttConsole topic={activeTopic} lastMessage={mqttData} />
              <LiveDataTable data={mqttData} />
            </div> */}

            <DiscoveryGrid
              currentData={mqttData}
              currentTopic={mqttData?.topic || "Desconhecido"}
              brokerId={selectedBrokerId}
            />
          </>
        );
      case "config":
        return (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Configurações
              </h1>
              <p className="text-sm text-gray-600">
                Gerencie sua conexão MQTT e preferências
              </p>
            </div>
            <div className="w-full">
              <BrokerConfigForm />
            </div>
          </>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-lg font-medium">Em desenvolvimento</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          onLogout={handleLogout}
        />

        {/* Conteúdo Principal */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="px-4 py-6">{renderContent()}</div>
        </main>
      </div>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
