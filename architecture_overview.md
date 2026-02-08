# Arquitetura de Conexões MQTT Otimizada

Este diagrama ilustra como o `MqttConnectionManager` (Singleton) atua como um "porteiro inteligente", permitindo que dezenas de componentes na interface consumam dados em tempo real utilizando o mínimo absoluto de conexões físicas (WebSockets) com os Brokers externos.

```mermaid
graph TD
    %% Cores e Estilos
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef manager fill:#f3e5f5,stroke:#7b1fa2,stroke-width:4px;
    classDef socket fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef broker fill:#fff3e0,stroke:#e65100,stroke-width:2px;

    subgraph "Interface do Usuário (Seu Dashboard)"
        direction TB
        C1[📉 Gráfico Tempo Real]:::component
        C2[🌡️ Card Temperatura]:::component
        C3[⚡ Status Máquina 1]:::component
        C4[🏭 Card Produção]:::component
        C5[⚙️ Configurações]:::component
    end

    subgraph "Camada Lógica (Hooks React)"
        direction TB
        H1(useMqtt):::component
        H2(useMqtt):::component
        H3(useMqtt):::component
        H4(useMqtt):::component
        H5(useMqtt):::component
    end

    %% O Manager centraliza todos os pedidos
    subgraph "Núcleo de Otimização (Singleton)"
        M[[🧠 MqttConnectionManager]]:::manager
    end

    %% Apenas conexões físicas necessárias são criadas
    subgraph "Camada Física (WebSockets)"
        S1[🔌 Socket Único: HiveMQ]:::socket
        S2[🔌 Socket Único: EMQX]:::socket
    end

    %% Brokers na Nuvem
    subgraph "Nuvem (External Brokers)"
        B1((☁️ HiveMQ Cloud)):::broker
        B2((☁️ EMQX Serverless)):::broker
    end

    %% Fluxo de Dados
    C1 --> H1
    C2 --> H2
    C3 --> H3
    C4 --> H4
    C5 --> H5

    H1 -- "Pede Conexão Hive" --> M
    H2 -- "Pede Conexão Hive" --> M
    H3 -- "Pede Conexão Hive" --> M
    H4 -- "Pede Conexão EMQX" --> M
    H5 -- "Pede Conexão EMQX" --> M

    M == "1 Conexão Compartilhada" ==> S1
    M == "1 Conexão Compartilhada" ==> S2

    S1 <== "Canal Seguro (TLS)" ==> B1
    S2 <== "Canal Seguro (TLS)" ==> B2

    %% Notas Explicativas
    linkStyle 10,11 stroke-width:4px,fill:none,stroke:purple;
```

## Pontos Chave:

1.  **Escalabilidade no Frontend**: Você pode ter 100 componentes na tela (Cards, Gráficos, Tabelas).
2.  **Eficiência de Rede**: Apenas **2 conexões reais** (uma para cada Broker distinto) são abertas.
3.  **Economia de Recursos**: O navegador economiza memória e o Broker não bloqueia sua conta por excesso de clientes.
4.  **Resiliência**: Se um componente falha, a conexão principal continua viva para os outros.
