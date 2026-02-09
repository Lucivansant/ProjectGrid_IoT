"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SVG from "./componentes/SVG";

export default function LoginPage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/Dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Informações */}
      <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
        {/* Background decorative elements - igual à hero section */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-linear-to-br from-blue-400/40 to-purple-500/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-linear-to-tr from-emerald-400/35 to-cyan-400/35 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-linear-to-r from-violet-300/25 to-pink-300/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        <SVG />

        <div className="relative z-10 flex flex-col justify-between p-12 text-gray-900 w-full">
          {/* Logo e Nome */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image src="/logo.svg" alt="ProjectGrid" width={40} height={40} />
              <span className="text-2xl font-semibold">ProjectGrid</span>
            </Link>
          </div>

          {/* Conteúdo Central */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-6">
                Plataforma IoT as a Service
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Conecte seus dispositivos IoT em minutos. Infraestrutura
                profissional pronta para uso, sem configurações complexas.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    HTTPS Nativo
                  </h3>
                  <p className="text-sm text-gray-600">
                    Comunicação 100% criptografada com certificado SSL/TLS
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Formato JSON
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dados em JSON puro, compatível com qualquer linguagem
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Tempo Real
                  </h3>
                  <p className="text-sm text-gray-600">
                    Veja seus sensores atualizando instantaneamente
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-600 text-sm">
            © 2026 ProjectGrid. Desenvolvido para profissionais IoT.
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo.svg" alt="ProjectGrid" width={32} height={32} />
              <span className="text-xl font-semibold text-gray-900">
                ProjectGrid
              </span>
            </Link>
          </div>

          {/* Cabeçalho do Formulário */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo ao ProjectGrid
            </h2>
            <p className="text-gray-600">Acesso direto ao sistema</p>
          </div>

          {/* Botão Simples de Entrar */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleEnter}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Entrar</span>
            </button>
          </div>

          {/* Informação adicional */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Ao continuar, você concorda com nossos{" "}
              <a href="#" className="text-gray-900 hover:underline font-medium">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="text-gray-900 hover:underline font-medium">
                Política de Privacidade
              </a>
            </p>
          </div>

          {/* Link para Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
