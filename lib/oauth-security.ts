// Security utilities for OAuth flow

// Limpa todos os dados temporários do OAuth
export function cleanupOAuthData() {
  localStorage.removeItem('oauth_temp_data');
  sessionStorage.removeItem('oauth_temp_data');
}

// Verifica e limpa dados expirados (mais de 60 segundos)
export function cleanupExpiredOAuthData() {
  try {
    const tempData = localStorage.getItem('oauth_temp_data') || sessionStorage.getItem('oauth_temp_data');
    if (tempData) {
      const data = JSON.parse(tempData);
      if (data.timestamp && Date.now() - data.timestamp > 60000) {
        cleanupOAuthData();
      }
    }
  } catch (error) {
    // Se der erro, limpa tudo por segurança
    cleanupOAuthData();
  }
}

// Executa limpeza automática ao carregar qualquer página
if (typeof window !== 'undefined') {
  cleanupExpiredOAuthData();
  
  // Limpa quando usuário sair da página
  window.addEventListener('beforeunload', cleanupOAuthData);
  
  // Limpa em intervalos curtos (backup)
  setInterval(cleanupExpiredOAuthData, 30000);
}

export default {
  cleanupOAuthData,
  cleanupExpiredOAuthData
};