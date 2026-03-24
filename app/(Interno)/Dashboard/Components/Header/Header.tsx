/**
 * Cabeçalho da Aplicação (Header).
 * Exibe o logotipo do ProjectGrid, informações do usuário logado
 * e controles de notificações e menu mobile.
 */
import Image from "next/image";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface HeaderProps {
  user: User | null;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

/**
 * Renderiza o cabeçalho superior com infos do usuário e menu mobile.
 */
export function Header({
  user,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: HeaderProps) {
  return (
    <header className="border-b border-gray-800 sticky top-0 bg-black z-50">
      <div className="w-full px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="ProjectGrid" width={32} height={32} />
          <span className="text-xl font-semibold text-white">ProjectGrid</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-300 rounded-md hover:bg-gray-900">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">
                  {user.user_metadata?.full_name}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            )}
            <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-medium overflow-hidden border border-gray-700">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.email?.charAt(0).toUpperCase() || "U"}</span>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-gray-300 rounded-md hover:bg-gray-900"
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
      </div>
    </header>
  );
}
