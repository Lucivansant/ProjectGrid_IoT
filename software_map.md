# Mapa do Sistema ProjectGrid

Este diagrama mapeia os componentes vitais do software e como eles interagem para garantir a conexão e o fluxo de dados em tempo real.

```mermaid
graph TD
    %% Estilos e Cores
    classDef ui fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef hook fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef core fill:#fff8e1,stroke:#fbc02d,stroke-width:3px;
    classDef storage fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef cloud fill:#eceff1,stroke:#455a64,stroke-width:2px,stroke-dasharray: 5 5;

    subgraph "Interface do Usuário (UI)"
        P1[🖥️ Dashboard Page]:::ui
        P2[⚙️ Broker Config Form]:::ui
        C1[📊 StatsGrid / ReliabilityGauge]:::ui
        C2[📋 DeviceTable]:::ui
    end

    subgraph "Lógica de Negócio (Hooks)"
        H1(🎣 useMqtt):::hook
        H2(🎣 useBrokerConfigs):::hook
        H3(🎣 useDeviceHistory):::hook
    end

    subgraph "Núcleo do Sistema (Core Services)"
        S1{🧠 MqttConnectionManager\nSingleton}:::core
        S2[🛠️ UniversalMqttClient\nWrapper Class]:::core
    end

    subgraph "Persistência & Dados"
        D1[(🗄️ Dexie DB\nIndexedDB Local)]:::storage
    end

    subgraph "Infraestrutura Externa (Cloud)"
        E1((🌩️ Supabase\nAuth & Postgres)):::cloud
        E2((☁️ MQTT Brokers\nHiveMQ / EMQX)):::cloud
    end

    %% Relações - Configuração e Auth
    P2 -- "CRUD Configs" --> H2
    H2 <-- "Auth & Data" --> E1
    P1 -- "Carrega Configs" --> E1

    %% Relações - Conexão em Tempo Real (O Grande Fluxo)
    P1 -- "1. Inicializa" --> H1
    C1 -- "Consome Dados" --> H1
    C2 -- "Consome Dados" --> H1

    H1 -- "2. Solicita Conexão" --> S1
    S1 -- "3. Instancia/Reutiliza" --> S2
    S2 <-- "4. WebSocket (Secure)" --> E2

    %% Fluxo de Dados (Callback)
    E2 -- "5. Mensagem Chega" --> S2
    S2 -- "6. Distribui Tópico" --> S1
    S1 -- "7. Notifica Listeners" --> H1
    H1 -- "8. Atualiza Estado React" --> P1

    %% Histórico
    P1 -- "9. Salva Histórico" --> H3
    H3 -- "10. Persiste" --> D1

    %% Notas de Estilo
    linkStyle 6,7,8,9,10,11 stroke-width:3px,stroke:#2e7d32;
```

## Legenda dos Componentes Chave

1.  **Dashboard Page**: O orquestrador visual. Decide qual broker conectar e exibe os componentes.
2.  **useMqtt (O Coração Lógico)**: Abstrai toda a complexidade. O componente só diz "Quero ouvir o tópico X no broker Y", e o hook revolve o resto. Implementa filtros para garantir que você só receba o que pediu.
3.  **MqttConnectionManager (O Porteiro)**: Garante a performance. Verifica se já existe uma conexão aberta via `Map<string, Client>`. Se existir, entrega a mesma. Evita duplicidade de sockets.
4.  **UniversalMqttClient (O Operário)**: A classe que suja as mãos. Lida com a biblioteca `mqtt.js`, reconexão automática, parseamento de JSON seguro e limpeza de sessão (`clean: true`).
5.  **Supabase & Dexie**: Supabase guarda *quem você é* e *suas configs*. Dexie guarda *seus dados históricos* localmente para o app ser rápido e barato.
