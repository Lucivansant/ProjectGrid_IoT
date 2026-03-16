
export default function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-10 font-mono text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Environment Variables</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-green-400">NEXT_PUBLIC_SUPABASE_URL:</h2>
          <p className="break-all">
            {url ? url : "UNDEFINED (Configuracao ausente no Cloudflare)"}
          </p>
        </div>

        <div>
          <h2 className="text-green-400">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h2>
          <p className="break-all">
            {key
              ? `${key.substring(0, 10)}... (Carregado com ${key.length} caracteres)`
              : "UNDEFINED (Configuracao ausente no Cloudflare)"}
          </p>
        </div>

        <div className="mt-8 p-4 border border-gray-700 bg-gray-900">
          <h3 className="text-yellow-400">Status:</h3>
          {url && key ? (
            <span className="text-green-500 font-bold">CONFIGURACAO OK</span>
          ) : (
            <span className="text-red-500 font-bold">CONFIGURACAO FALHOU</span>
          )}
        </div>
      </div>
    </div>
  );
}
