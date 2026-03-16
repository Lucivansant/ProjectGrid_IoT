"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="ProjectGrid" width={32} height={32} />
            <span className="text-xl font-semibold text-gray-900">
              ProjectGrid
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Recursos
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Planos
            </a>
            <a
              href="#support"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Suporte
            </a>
            <a
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Entrar
            </a>
            <a
              href="/login"
              className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Entrar
            </a>
          </nav>

          <button
            className="md:hidden p-2 text-gray-600 rounded-md hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 shadow-lg absolute w-full left-0 top-full">
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recursos
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Planos
              </a>
              <a
                href="#support"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Suporte
              </a>
              <hr className="border-gray-100" />
              <a
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </a>
              <a
                href="/login"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white shadow-[inset_0_-15px_25px_-15px_rgba(0,0,0,0.2)]">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-br from-blue-400/40 to-purple-500/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-linear-to-tr from-emerald-400/35 to-cyan-400/35 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-linear-to-r from-violet-300/25 to-pink-300/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        {/* Neural Network Animation */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <style>{`
              @keyframes blink1 { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
              @keyframes blink2 { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
              @keyframes blink3 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.9; } }
              @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
              .node1 { animation: blink1 3s ease-in-out infinite; }
              .node2 { animation: blink2 4s ease-in-out infinite; }
              .node3 { animation: blink3 3.5s ease-in-out infinite; }
              .node4 { animation: blink1 4.5s ease-in-out infinite; }
              .node5 { animation: blink2 3.2s ease-in-out infinite; }
              .node6 { animation: blink3 4.2s ease-in-out infinite; }
              .connection { animation: pulse 4s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* Connections */}
          <g
            className="connection"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
          >
            <line x1="15%" y1="20%" x2="35%" y2="40%" />
            <line x1="35%" y1="40%" x2="65%" y2="35%" />
            <line x1="65%" y1="35%" x2="85%" y2="25%" />
            <line x1="15%" y1="20%" x2="25%" y2="70%" />
            <line x1="25%" y1="70%" x2="55%" y2="75%" />
            <line x1="55%" y1="75%" x2="85%" y2="25%" />
            <line x1="35%" y1="40%" x2="55%" y2="75%" />
            <line x1="65%" y1="35%" x2="75%" y2="80%" />
            <line x1="25%" y1="70%" x2="75%" y2="80%" />
            {/* New connections */}
            <line x1="15%" y1="20%" x2="50%" y2="15%" />
            <line x1="50%" y1="15%" x2="85%" y2="25%" />
            <line x1="35%" y1="40%" x2="25%" y2="70%" />
            <line x1="50%" y1="15%" x2="65%" y2="35%" />
            <line x1="10%" y1="50%" x2="35%" y2="40%" />
            <line x1="10%" y1="50%" x2="25%" y2="70%" />
            <line x1="90%" y1="60%" x2="85%" y2="25%" />
            <line x1="90%" y1="60%" x2="75%" y2="80%" />
          </g>

          {/* Nodes */}
          <circle
            className="node1"
            cx="15%"
            cy="20%"
            r="6"
            fill="#6366f1"
            opacity="0.8"
          />
          <circle
            className="node2"
            cx="35%"
            cy="40%"
            r="7"
            fill="#8b5cf6"
            opacity="0.8"
          />
          <circle
            className="node3"
            cx="65%"
            cy="35%"
            r="6"
            fill="#06b6d4"
            opacity="0.8"
          />
          <circle
            className="node4"
            cx="85%"
            cy="25%"
            r="7"
            fill="#10b981"
            opacity="0.8"
          />
          <circle
            className="node5"
            cx="25%"
            cy="70%"
            r="6"
            fill="#8b5cf6"
            opacity="0.8"
          />
          <circle
            className="node6"
            cx="55%"
            cy="75%"
            r="7"
            fill="#06b6d4"
            opacity="0.8"
          />
          <circle
            className="node1"
            cx="75%"
            cy="80%"
            r="6"
            fill="#6366f1"
            opacity="0.8"
          />
          {/* New nodes */}
          <circle
            className="node3"
            cx="50%"
            cy="15%"
            r="6"
            fill="#a78bfa"
            opacity="0.8"
          />
          <circle
            className="node5"
            cx="10%"
            cy="50%"
            r="6"
            fill="#f472b6"
            opacity="0.8"
          />
          <circle
            className="node2"
            cx="90%"
            cy="60%"
            r="7"
            fill="#34d399"
            opacity="0.8"
          />

          {/* Gradient for connections */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium mb-6">
                Plataforma IoT as a Service
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] mb-6 tracking-tight">
                Monitore sua infraestrutura IoT com alta performance
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Infraestrutura profissional pronta para uso. Sem configurações
                complexas, sem servidores para gerenciar. Foque no que importa:
                seu projeto IoT.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <a
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
                >
                  Entrar no Sistema
                </a>
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
                >
                  Ver Demonstração
                </a>
              </div>

              {/* Destaque MQTT e Estatísticas */}
              <div className="bg-linear-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <svg
                    className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Broker MQTT Integrado (Zero Config)
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Conectividade MQTT/WSS nativa direto do seu hardware. Visualize fluxos de telemetria do seu ESP32, Arduino ou CLP sem depender de nuvem de terceiros.
                    </p>
                  </div>
                </div>
                
                {/* Micro-Estatísticas */}
                <div className="grid grid-cols-3 gap-2 border-t border-gray-200 pt-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">15k+</p>
                    <p className="text-xs text-gray-500 font-medium">Conexões/Nó</p>
                  </div>
                  <div className="text-center border-l border-r border-gray-200">
                    <p className="text-xl font-bold text-gray-900">&lt;5ms</p>
                    <p className="text-xs text-gray-500 font-medium">Latência Média</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">100%</p>
                    <p className="text-xs text-gray-500 font-medium">Autossuficiente</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Configuração em minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Suporte a ESP32/Arduino</span>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              {/* World Map Visualization */}
              <Image
                src="/mapa.svg"
                alt="Global Network Map"
                width={800}
                height={533}
                className="w-full h-auto drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Tudo que você precisa para escalar sua infraestrutura IoT
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Desenvolvido para profissionais que precisam de confiabilidade,
              segurança e simplicidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - MQTT/WSS */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Conexão WSS Segura
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Navegue com tranquilidade. Suporte nativo à conexões MQTT via WebSockets (SSL/TLS) para tráfego simultâneo e seguro entre seus Brokers e o Painel.
              </p>
            </div>

            {/* Feature 2 - JSON */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Payload JSON
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Interpretação automática de Payload em formato JSON puro. O Grid reconhece as chaves numéricas do seu ESP32 mapeando os limites automaticamente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Dados em Tempo Real
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Veja seus sensores atualizando instantaneamente. Sem polling,
                sem atrasos. Infraestrutura WebSocket de alta performance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Conexão Simplificada
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Esqueça deploys difíceis. Utilize o nosso potente servidor interno ou conecte brokers de terceiros como HiveMQ, AWS e EMQX informando apenas a URL.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Arquitetura Escalável
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Cresça de forma inteligente. Motor multi-thread suportando de 1 a 15.000+ conexões simultâneas ultra-rápidas por núcleo instalado.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Custo-Benefício
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Pague apenas pelo que usar. Sem contas de VPS caras. Planos a
                partir de R$ 29/mês para dispositivos ilimitados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="ProjectGrid" width={32} height={32} />
              <span className="text-lg font-semibold text-gray-900">
                ProjectGrid
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Termos
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Documentação
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Contato
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2026 ProjectGrid. Desenvolvido para profissionais IoT que
            valorizam simplicidade.
          </div>
        </div>
      </footer>
    </div>
  );
}
