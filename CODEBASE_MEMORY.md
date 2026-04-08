# 🧠 ProjectGrid IoT: Memória Técnica do Software

Este documento descreve a arquitetura, o fluxo de dados e a responsabilidade de cada arquivo no projeto **ProjectGrid IoT**. Ele foi projetado para ser consumido por IAs ou desenvolvedores para uma compreensão rápida e profunda do sistema.

---

## 🏗️ 1. Visão Geral da Arquitetura

O **ProjectGrid IoT** é uma aplicação híbrida (Web/Desktop) para monitoramento industrial via MQTT.
- **Backend & Broker**: Um servidor customizado em Node.js (`server.js`) que roda simultaneamente o Next.js e um Broker MQTT (Aedes).
- **Desktop**: Uma camada Electron (`electron-main.js`) que encapsula o servidor e a interface.
- **Persistência Dupla**:
    1. **SQLite (`projectgrid.db`)**: No lado do servidor, para configurações permanentes de conexão dos Brokers e dados de usuários.
    2. **IndexedDB (`LocalDatabase.ts`)**: No lado do cliente (browser), para cache de mensagens de sensores e logs de alta frequência (usando Dexie.js).
- **Frontend**: Dashboard moderno construído com Next.js (App Router), Tailwind CSS e Recharts.

---

## 📂 2. Estrutura de Arquivos e Funções

### 🚀 Raiz do Projeto (Bootstrap & Config)

| Arquivo | Descrição |
| :--- | :--- |
| `server.js` | **Coração do Servidor.** Inicia o Next.js e o Broker MQTT Aedes (TCP na porta 1885 e WebSockets na 8885). É o ponto de entrada principal. |
| `electron-main.js` | **Entrada do Desktop.** Configura a janela do Electron e inicia o `server.js` como um processo filho (`spawn`). |
| `simulate_device.js` | **Ferramenta de Teste.** Script Node.js que simula um dispositivo IoT enviando dados JSON aleatórios para o broker local. |
| `package.json` | Define dependências (Aedes, Dexie, MQTT.js, SQLite3, Recharts) e scripts de execução. |
| `projectgrid.db` | Arquivo do banco de dados SQLite onde são salvas as configurações de conexão dos brokers. |
| `tsconfig.json` | Configurações do compilador TypeScript para o projeto. |
| `postcss.config.mjs` / `next.config.ts` | Configurações de build do Next.js e Tailwind CSS. |

### 🛠️ Biblioteca Core (`app/(Interno)/_lib/`)

Esta pasta contém a lógica de "baixo nível" e serviços compartilhados da aplicação.

#### 🗄️ Database e Actions
| Arquivo | Descrição |
| :--- | :--- |
| `db/LocalDatabase.ts` | Configuração do **IndexedDB (Dexie)**. Define as tabelas `messages` e `device_configs` para armazenamento local no browser. |
| `actions/brokerActions.ts` | **Server Actions (SQLite).** Funções que rodam no servidor para CRUD (Criar, Ler, Atualizar, Deletar) de configurações no `projectgrid.db`. |

#### 📡 Serviços MQTT
| Arquivo | Descrição |
| :--- | :--- |
| `services/UniversalMqttClient.ts` | Classe que abstrai o `mqtt.js`. Lida com conexão, subscrição, publicação e normalização do payload JSON ou String. |
| `services/MqttConnectionManager.ts` | Singleton que gerencia múltiplas instâncias de clientes MQTT, garantindo eficiência e evitando conexões duplicadas. |

#### ⚓ Hooks (React)
| Arquivo | Descrição |
| :--- | :--- |
| `hooks/useMqtt.ts` | Hook principal que conecta a interface aos tópicos MQTT. Atualiza o estado do React em tempo real. |
| `hooks/useDeviceHistory.ts` | Hook que recupera mensagens históricas do IndexedDB para alimentar gráficos e tabelas. |
| `hooks/useBrokerConfigs.ts` | Gerencia o estado das configurações de brokers recuperadas via Server Actions. |

### 📊 Dashboard e Componentes (`app/(Interno)/Dashboard/Components/`)

Interface do usuário organizada de forma modular e visualmente rica.

#### 🏗️ Componentes de Layout e Navegação
| Arquivo | Descrição |
| :--- | :--- |
| `Sidebar/Sidebar.tsx` | Menu lateral de navegação com links para Dashboard, Configurações e Logs. |
| `Header/Header.tsx` | Barra superior com status da conexão, notificações e perfil do usuário. |

#### 🧩 Widgets de Monitoramento (Discovery/)
| Arquivo | Descrição |
| :--- | :--- |
| `StorageStatusWidget.tsx` | Widget de status de armazenamento com progresso circular e métricas de saúde dos dispositivos. |
| `AlarmWidget.tsx` | Gerencia e exibe alertas baseados em limites pré-definidos para os sensores. |
| `DeviceChart.tsx` | Renderiza gráficos de linha temporais usando **Recharts**, processando dados do IndexedDB. |
| `DiscoveryGrid.tsx` | Grid principal onde os cards de dispositivos detectados são organizados. |

#### 📈 Estatísticas (Stats/)
| Arquivo | Descrição |
| :--- | :--- |
| `StatsGrid.tsx` / `StorageSummaryCard.tsx` | Cards de resumo com KPIs (Indicadores Chave de Performance) do sistema. |
| `ReliabilityGauge.tsx` | Medidor visual de confiabilidade do sinal/conexão. |

---

## 🔄 3. Fluxo de Dados (Caminho da Mensagem)

1.  **Origem**: Um dispositivo físico (ESP32) envia um payload JSON para o tópico `v1/equipamento1` via TCP na porta `1885`.
2.  **Broker Local**: O `server.js` (Aedes) recebe a mensagem e a retransmite para todos os inscritos.
3.  **Client-Side**: O `UniversalMqttClient.ts` conectado via WebSockets (porta `8885`) no dashboard recebe a mensagem.
4.  **Persistência**: A mensagem é salva imediatamente no **IndexedDB** (`LocalDatabase.ts`) para consulta histórica rápida.
5.  **UI Update**: O hook `useMqtt.ts` detecta a nova mensagem e atualiza os widgets do React.
6.  **Visualização**: O `StorageStatusWidget.tsx` ou `DeviceChart.tsx` reflete o novo dado sem recarregar a página.

---

## 🔐 4. Segurança e Persistência de Configurações

- **Credenciais**: Senhas e usuários de brokers remotos são armazenados apenas no SQLite (`projectgrid.db`) no servidor.
- **Sessão**: O dashboard utiliza o Next.js Server Actions para garantir que as credenciais sensíveis não fiquem expostas no código do cliente browser de forma insegura.
