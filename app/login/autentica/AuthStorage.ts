export const STORAGE_KEY = 'temp_google_auth_token';
const EXPIRATION_KEY = 'temp_google_auth_expiration';
const EXPIRATION_TIME_MS = 60 * 1000; // 60 segundos

export const AuthStorage = {
  save(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, token);
      const expirationTime = Date.now() + EXPIRATION_TIME_MS;
      localStorage.setItem(EXPIRATION_KEY, expirationTime.toString());
    }
  },

  get() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEY);
      const expiration = localStorage.getItem(EXPIRATION_KEY);

      if (!token || !expiration) {
        return null; // Não tem token ou não tem metadado de validade
      }

      // Verifica se já passou o tempo (expirou)
      if (Date.now() > parseInt(expiration, 10)) {
        console.warn('Token de autenticação expirado (timeout de 60s). Limpando dados.');
        this.clear();
        return null;
      }

      return token;
    }
    return null;
  },

  clear() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRATION_KEY);
    }
  }
};
