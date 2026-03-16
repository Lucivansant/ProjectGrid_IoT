# 🚀 ProjectGrid IoT

**ProjectGrid** é uma plataforma de monitoramento industrial de código aberto projetada para preencher a lacuna entre o chão de fábrica e a gestão estratégica. Utilizando tecnologias modernas de web (Next.js) e desktop (Electron), o ProjectGrid permite que você visualize, armazene e gerencie dados de maquinário em tempo real sem depender exclusivamente de infraestruturas de nuvem caras e complexas.

![Status do Projeto](https://img.shields.io/badge/Status-Developing-blue?style=for-the-badge)
![Licença](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Tecnologia](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge)
![Plataforma](https://img.shields.io/badge/Electron-Desktop-blue?style=for-the-badge)

---

## 🎯 Objetivo
Transformar dados brutos vindos de CLPs, Inversores de Frequência e Sensores (via ESP32/Gateways) em informações acionáveis para manutenção preditiva e relatórios de status.

## ✨ Diferenciais
- **Edge First Architecture**: O software funciona como um servidor MQTT local, garantindo que o monitoramento continue mesmo sem internet.
- **Visualização Industrial**: Focado em sinais críticos como picos de corrente, rotação (RPM) e status de barramento.
- **Histórico Persistente**: Armazenas dados localmente via SQLite e Dexie para consultas rápidas e auditoria de até 1 ano de registros.
- **Híbrido e Flexível**: Use como um software desktop dedicado (Windows) ou acesse via web em uma VPS.

---

## 🏗️ Arquitetura Técnica
O ProjectGrid foi construído sobre uma base robusta para garantir baixa latência e alta confiabilidade:

- **Frontend**: Next.js 15 (App Router) + React + Tailwind CSS.
- **Desktop**: Electron (Embalando a aplicação web para acesso nativo).
- **Backend/Broker**: Internal MQTT Broker (Aedes) rodando em Node.js.
- **Database**: SQLite (Armazenamento de configurações) + Dexie.js (Armazenamento de mensagens MQTT).
- **Segurança**: Server Actions para manipulação de credenciais e sanitização de dados.

---

## 🚀 Guia de Início Rápido

### Pré-requisitos
- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- Git

### Instalação
1. Clone o repositório:
```bash
git clone https://github.com/Lucivansant/ProjectGrid_IoT.git
cd ProjectGrid_IoT
```

2. Instale as dependências:
```bash
npm install
```

### Rodando em Desenvolvimento
Para rodar a versão web:
```bash
npm run dev
```

Para rodar a versão **Desktop (Electron)**:
```bash
npm run electron:dev
```

---

## 🔌 Conectando Seus Dispositivos
O ProjectGrid possui um broker MQTT interno preparado para receber dados. 

**Configurações do Broker Interno:**
- **Protocolo TCP**: Porta `1885` (Ideal para ESP32/Hardware)
- **Protocolo WebSocket**: Porta `8885` (Usado pela interface web)
- **Tópico Sugerido**: `projectgrid/device_id`

**Exemplo de Payload (JSON):**
```json
{
  "timestamp": 1710542400000,
  "sensors": {
    "corrente": 12.5,
    "rpm": 1750
  },
  "status": {
    "motor_ligado": true
  }
}
```

---

## 🛠️ Contribuindo
Este é um projeto **Open Source**. Toda contribuição é bem-vinda!
1. Faça um Fork do projeto.
2. Crie uma Branch para sua feature (`git checkout -b feature/NovaFeature`).
3. Faça o Commit das suas alterações (`git commit -m 'Add: Alguma funcionalidade'`).
4. Envie para o GitHub (`git push origin feature/NovaFeature`).
5. Abra um Pull Request.

---

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 👨‍💻 Desenvolvedor
Criado por [Lucivan Santos](https://github.com/Lucivansant). 

*"Transformando dados industriais em lucro e eficiência."*
