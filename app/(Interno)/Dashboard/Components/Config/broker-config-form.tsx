/**
 * Formulário de Configuração de Broker.
 * Permite ao usuário cadastrar, editar e excluir as configurações de conexão
 * com diferentes brokers MQTT, incluindo suporte a tutoriais guiados.
 */
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Edit3, Server, ShieldCheck } from "lucide-react";
import {
  useBrokerConfigs,
  BrokerConfig,
} from "../../../_lib/hooks/useBrokerConfigs";
import { BrokerConfigPublic, getBrokerSecret } from "../../../_lib/actions/brokerActions";

/**
 * Renderiza a interface de gerenciamento de brokers e tutoriais de ajuda.
 */
export function BrokerConfigForm() {
  const {
    brokers,
    loading: hookLoading,
    error,
    loadBrokers,
    saveBroker,
    deleteBroker,
  } = useBrokerConfigs();
  // Estado para o Modal de Tutorial
  const [activeTutorial, setActiveTutorial] = useState<{
    title: string;
    description: React.ReactNode;
    link?: string;
    configSnippet?: string;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // UI Feedback local
  const [uiMsg, setUiMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<Partial<BrokerConfig>>({
    name: "",
    broker_url: "",
    username: "",
    password: "",
    port: 8883,
    use_ssl: true,
  });

  // Carregar Brokers ao montar
  useEffect(() => {
    loadBrokers();
  }, [loadBrokers]);

  // (Erro removido: sincronização via render direto)

  // Preencher formulário ao clicar em editar
  /**
   * Prepara o formulário para edição de um broker existente.
   */
  const handleEdit = async (broker: BrokerConfigPublic) => {
    setSelectedId(broker.id);
    setUiMsg(null);
    
    // Mostra loading local se necessário, ou apenas busca o secret
    try {
      const secrets = await getBrokerSecret(broker.id);
      setFormData({
        name: broker.name,
        broker_url: broker.broker_url,
        username: secrets?.username || "",
        password: secrets?.password || "",
        port: broker.port,
        use_ssl: broker.use_ssl,
      });
    } catch (err) {
      console.error("Erro ao carregar segredos:", err);
      setUiMsg({ type: "error", text: "Erro ao carregar dados sensíveis." });
    }
  };

  /**
   * Limpa o formulário para criação de um novo broker.
   */
  const handleNew = () => {
    setSelectedId(null);
    setFormData({
      name: "",
      broker_url: "",
      username: "",
      password: "",
      port: 8883,
      use_ssl: true,
    });
    setUiMsg(null);
  };

  /**
   * Remove permanentemente um broker após confirmação.
   */
  const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Garante que não faça submit se estiver num form
    e.stopPropagation(); // Impede abrir o modo de edição

    if (confirm("Tem certeza que deseja excluir este broker?")) {
      // Optimistic Update: Remove visualmente antes de confirmar

      // Força atualização da lista via mutate ou reload (aqui simulamos chamando loadBrokers mas o ideal seria setBrokers localmente se exposto)

      const success = await deleteBroker(id);
      if (success) {
        setUiMsg({ type: "success", text: "Broker excluído com sucesso." });
        if (selectedId === id) handleNew();
      } else {
        alert("Erro ao excluir. Tente novamente.");
      }
    }
  };

  /**
   * Valida e envia as configurações do broker para o servidor.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiMsg(null);

    const success = await saveBroker({
      ...formData,
      id: selectedId || undefined,
    });

    if (success) {
      setUiMsg({ type: "success", text: "Broker salvo com sucesso!" });
      if (!selectedId) handleNew(); // Limpa se for novo
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
      {/* Modal de Tutorial */}
      {activeTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              💡 Como configurar: {activeTutorial.title}
            </h3>
            <div className="text-gray-600 mb-6 text-sm leading-relaxed">
              {activeTutorial.description}
            </div>

            {activeTutorial.configSnippet && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-6 font-mono text-xs text-gray-700 overflow-x-auto">
                <p className="font-semibold text-gray-500 mb-1 select-none">
                  Configuração Recomendada:
                </p>
                <code className="whitespace-pre-wrap">
                  {activeTutorial.configSnippet}
                </code>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActiveTutorial(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
              >
                Fechar
              </button>
              {activeTutorial.link && (
                <a
                  href={activeTutorial.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  Acessar Site Oficial
                  <Server size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Meus Brokers MQTT
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie suas conexões (HiveMQ, AWS, Mosquitto).
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
        >
          <Plus size={16} /> Novo Broker
        </button>
      </div>

      {/* Lista de Brokers Cadastrados (Horizontal Scollable se muitos) */}
      <div className="flex flex-wrap gap-3 mb-8">
        {brokers.length === 0 && !hookLoading && (
          <p className="text-gray-400 text-sm italic w-full text-center py-4 border border-dashed rounded-lg">
            Nenhum broker cadastrado.
          </p>
        )}

        {brokers.map((broker) => (
          <div
            key={broker.id}
            onClick={() => handleEdit(broker)}
            className={`cursor-pointer group relative flex flex-col min-w-[200px] border rounded-lg p-3 transition-all ${
              selectedId === broker.id
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-gray-800 text-sm line-clamp-1">
                {broker.name || "Sem Nome"}
              </span>
              <button
                onClick={(e) => handleDeleteClick(broker.id, e)}
                className="text-gray-400 hover:text-red-500 p-1 transition-colors z-10 relative"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div
              className="text-xs text-gray-500 font-mono truncate w-full"
              title={broker.broker_url}
            >
              {broker.broker_url}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 my-6"></div>

      {/* Formulário de Edição/Criação */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          {selectedId ? <Edit3 size={16} /> : <Plus size={16} />}
          {selectedId ? "Editando Conexão" : "Nova Conexão"}
        </h3>

        {/* Botões de Ajuda (Tutoriais) */}
        {!selectedId && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() =>
                setActiveTutorial({
                  title: "ProjectGrid Embutido (Local)",
                  description:
                    "Você sabia que este software já roda o próprio servidor MQTT? Ao usar esta configuração, seus dispositivos conectam diretamente nesta máquina / VPS sem precisarem da internet externa (Nuvem).",
                  link: "",
                  configSnippet:
                    "Para o ESP32 (Wi-Fi): TCP Porta 1885\n(Aponte o IP do ESP32 para o IP deste computador).\n\nPara este Painel: \nURL: ws://localhost:8885/mqtt\nPorta: 8885\nSSL: Desativado",
                })
              }
              className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Server size={18} />
              </div>
              <div className="text-xs font-semibold text-gray-700">
                Broker Local
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveTutorial({
                  title: "HiveMQ Público",
                  description:
                    "O HiveMQ Public Broker é gratuito e ideal para testes rápidos. O servidor é aberto, então não trafegue dados sensíveis.",
                  link: "https://www.hivemq.com/public-mqtt-broker/",
                  configSnippet:
                    "URL: wss://broker.hivemq.com:8884/mqtt\nPorta: 8884\nSSL: Ativado",
                })
              }
              className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                🐝
              </div>
              <div className="text-xs font-semibold text-gray-700">
                Como usar HiveMQ
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTutorial({
                  title: "EMQX Serverless (Recomendado)",
                  description: (
                    <ol className="list-decimal list-inside space-y-2 marker:text-blue-600">
                      <li>
                        Acesse o site da EMQX e crie uma conta gratuita (sem
                        cartão).
                      </li>
                      <li>
                        No painel, clique em <b>New Deployment</b> e escolha{" "}
                        <b>Serverless</b>.
                      </li>
                      <li>
                        Após criar, clique no nome do projeto para ver o{" "}
                        <b>Overview</b>.
                      </li>
                      <li>
                        No menu lateral, vá em <b>Authentication</b> e crie um{" "}
                        <b>User/Password</b> (anote esses dados!).
                      </li>
                      <li>
                        Volte ao Overview e copie o endereço <b>Connect URL</b>{" "}
                        (começa com <code>wss://</code>).
                      </li>
                    </ol>
                  ),
                  link: "https://www.emqx.com/en/cloud/serverless-mqtt-broker",
                  configSnippet:
                    "URL: wss://<SEU-ID>.emqxsl.com:8084/mqtt\nPorta: 8084\nSSL: Ativado\nUsuário/Senha: (Os que você criou no passo 4)",
                })
              }
              className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                💠
              </div>
              <div className="text-xs font-semibold text-gray-700">
                Criar Conta EMQX
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTutorial({
                  title: "Mosquitto Local",
                  description: (
                    <ol className="list-decimal list-inside space-y-2 marker:text-purple-600">
                      <li>Instale o Mosquitto no seu PC ou Raspberry Pi.</li>
                      <li>
                        Localize o arquivo{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          mosquitto.conf
                        </code>
                        .
                      </li>
                      <li>
                        Abra o arquivo como Administrador/Root e adicione ao
                        final:
                      </li>
                      <li>Reinicie o serviço do Mosquitto para aplicar.</li>
                    </ol>
                  ),
                  link: "https://mosquitto.org/man/mosquitto-conf-5.html",
                  configSnippet:
                    "listener 9001\nprotocol websockets\nallow_anonymous true",
                })
              }
              className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                🦟
              </div>
              <div className="text-xs font-semibold text-gray-700">
                Configurar Mosquitto
              </div>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome (Apelido)
            </label>
            <input
              type="text"
              placeholder="Ex: Broker Lab, AWS IoT..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🌐 URL do Broker (WSS)
            </label>
            <input
              type="text"
              placeholder="wss://broker.hivemq.com:8884/mqtt"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={formData.broker_url || ""}
              onChange={(e) =>
                setFormData({ ...formData, broker_url: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porta
              </label>
              <input
                type="number"
                placeholder="8883"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.port}
                onChange={(e) =>
                  setFormData({ ...formData, port: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex-1 flex items-center pt-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={formData.use_ssl}
                  onChange={(e) =>
                    setFormData({ ...formData, use_ssl: e.target.checked })
                  }
                />
                <ShieldCheck size={16} className="text-green-600" />
                Usar SSL (WSS)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <input
                type="text"
                placeholder="ex: admin"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.username || ""}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Feedback Messages */}
          {(uiMsg || error) && (
            <div
              className={`p-3 rounded-lg text-sm border ${
                uiMsg?.type === "error" || error
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {uiMsg?.text || error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {selectedId && (
              <button
                type="button"
                onClick={handleNew}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                disabled={hookLoading}
              >
                Cancelar Edição
              </button>
            )}
            <button
              type="submit"
              disabled={hookLoading}
              className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm ${
                hookLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {hookLoading ? (
                "Salvando..."
              ) : (
                <>
                  <Save size={18} />
                  {selectedId ? "Atualizar Broker" : "Salvar Broker"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
