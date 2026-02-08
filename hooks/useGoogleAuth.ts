import { useState, useCallback } from 'react';
import { AuthStorage } from '@/app/login/autentica/AuthStorage';
import { Auth } from '@/app/login/autentica/Auth';

interface AuthState {
  isLoading: boolean;
  error: string | null;
}

interface GoogleAuthConfig {
  clientId?: string;
  redirectUri?: string;
  scopes?: string[];
  popupOptions?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface UseGoogleAuthReturn {
  login: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

class GoogleAuthService {
  private config: GoogleAuthConfig;
  private popup: Window | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(config: GoogleAuthConfig = {}) {
    const isBrowser = typeof window !== 'undefined';
    
    this.config = {
      clientId: config.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: config.redirectUri || (isBrowser ? `${window.location.origin}/auth/callback` : ''),
      scopes: config.scopes || ['openid', 'email', 'profile'],
      popupOptions: config.popupOptions || 'width=500,height=600,scrollbars=yes'
    };
  }

  private generateNonce(): string {
    const part1 = Math.random()?.toString(36)?.substring(2, 15) || '';
    const part2 = Math.random()?.toString(36)?.substring(2, 15) || '';
    return part1 + part2;
  }

  private buildAuthUrl(nonce: string): string {
    const params = new URLSearchParams();
    params.append('client_id', this.config.clientId || '');
    params.append('redirect_uri', this.config.redirectUri || '');
    params.append('response_type', 'id_token');
    params.append('scope', (this.config.scopes || []).join(' '));
    params.append('nonce', nonce || '');
    params.append('prompt', 'select_account');

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private async handleAuthCallback(): Promise<AuthResult> {
    const token = AuthStorage.get();
    
    if (!token) {
      return { success: false, error: 'Login cancelado ou não concluído' };
    }

    try {
      await Auth.syncWithSupabase();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sincronizar com Supabase';
      return { success: false, error: `Erro: ${errorMessage}` };
    }
  }

  private monitorPopup(): Promise<AuthResult> {
    return new Promise((resolve) => {
      if (!this.popup) {
        resolve({ success: false, error: 'Popup não foi aberto' });
        return;
      }

      this.checkInterval = setInterval(async () => {
        if (this.popup?.closed) {
          this.cleanup();
          const result = await this.handleAuthCallback();
          resolve(result);
        }
      }, 1000);
    });
  }

  private cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.popup = null;
  }

  public async login(): Promise<AuthResult> {
    try {
      if (!this.config.clientId) {
        return { success: false, error: 'Google Client ID não configurado' };
      }

      const nonce = this.generateNonce();
      const authUrl = this.buildAuthUrl(nonce);
      
      this.popup = window.open(authUrl, 'google-auth', this.config.popupOptions || 'width=500,height=600,scrollbars=yes');
      
      if (!this.popup) {
        return { success: false, error: 'Não foi possível abrir a janela de autenticação' };
      }

      return await this.monitorPopup();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar autenticação';
      return { success: false, error: errorMessage };
    }
  }

  public redirectToDashboard(): void {
    window.location.href = '/Dashboard';
  }

  public destroy(): void {
    this.cleanup();
  }
}

export function useGoogleAuth(): UseGoogleAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null
  });

  const authService = new GoogleAuthService();

  const login = useCallback(async (): Promise<void> => {
    setState({ isLoading: true, error: null });

    try {
      const result = await authService.login();
      
      if (result.success) {
        authService.redirectToDashboard();
      } else {
        setState({ isLoading: false, error: result.error || 'Erro desconhecido' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar autenticação';
      setState({ isLoading: false, error: errorMessage });
    }
  }, [authService]);

  return {
    login,
    isLoading: state.isLoading,
    error: state.error
  };
}