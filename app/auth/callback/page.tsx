"use client";

import { useEffect } from "react";
import { AuthStorage } from "@/app/login/autentica/AuthStorage";

export default function AuthCallback() {
  useEffect(() => {
    // Função para extrair parâmetros da URL (hash)
    const handleCallback = () => {
      // O Google no modo 'id_token' retorna os dados no fragmento (hash) da URL: #id_token=...
      const hash = window.location.hash.substring(1); // Remove o '#'
      const params = new URLSearchParams(hash);

      const idToken = params.get("id_token");
      const error = params.get("error");

      if (idToken) {
        // Salva o token usando nossa storage
        AuthStorage.save(idToken);

        // Fecha o popup (que será detectado pelo hook useGoogleAuth na janela principal)
        window.close();
      } else if (error) {
        console.error("Erro no callback do Google:", error);
        window.close();
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-600">Autenticando...</p>
      </div>
    </div>
  );
}
