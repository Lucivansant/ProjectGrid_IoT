/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const aedesLib = require('aedes');
const aedesServerFactory = require('aedes-server-factory');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // 1. Iniciar Servidor Web do Next.js
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> 🚀 Next.js App rodando em http://${hostname}:${port}`);
  });

  // 2. Iniciar Servidor Broker MQTT (Aedes)
  const aedes = aedesLib();

  // 2.1 Porta TCP Padrão (1885) - Para ESP32, Arduino, Python, etc.
  const mqttServer = aedesServerFactory.createServer(aedes);
  const MQTT_PORT = 1885;
  
  mqttServer.listen(MQTT_PORT, () => {
    console.log(`> 🔌 Broker MQTT (TCP) rodando na porta ${MQTT_PORT}`);
  });

  // 2.2 Porta WebSockets (8885) - Para o Painel de Controle via Navegador
  const wsServer = aedesServerFactory.createServer(aedes, { ws: true });
  const WS_PORT = 8885;
  
  wsServer.listen(WS_PORT, () => {
    console.log(`> 🌐 Broker MQTT (WebSocket) rodando na porta ${WS_PORT}`);
  });

  // Eventos de Logging do Broker
  aedes.on('client', (client) => {
    console.log(`[Broker] Cliente Conectado: ${client ? client.id : 'Desconhecido'}`);
  });

  aedes.on('clientDisconnect', (client) => {
    console.log(`[Broker] Cliente Desconectado: ${client ? client.id : 'Desconhecido'}`);
  });

  aedes.on('publish', (packet) => {
    // Ignorar tópicos internos do provedor ($SYS) para não flodar o console
    if (packet.topic && !packet.topic.startsWith('$SYS')) {
      console.log(`[Broker] Nova Mensagem no Tópico '${packet.topic}' payload: ${packet.payload.toString()}`);
    }
  });
});
