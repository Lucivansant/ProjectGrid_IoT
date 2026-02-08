const mqtt = require('mqtt');

// ============================================================================
// CONFIGURAÇÃO DA FROTA (CLIENTES REAIS INDEPENDENTES)
// ============================================================================
const CONFIG = {
  BROKER_URL: 'wss://bc7f53d19dcc468c8a7f2f26fbe544f0.s1.eu.hivemq.cloud:8884/mqtt',
  USERNAME: 'admin123',
  PASSWORD: 'Admin3205741',
  TOPIC_PREFIX: 'projectgrid/cliente_a/frota',
  NUM_DEVICES: 20, // 20 conexões simultâneas reais
};

console.log('🚀 Iniciando Clientes Independentes...');

// Lista de tipos de equipamentos para variar
const TYPES = ['CHILLER', 'COMPRESSOR', 'MOTOR', 'GERADOR', 'BOMBA'];

// Função Fábrica: Cria um "Dispositivo Virtual" completo e isolado
function criarDispositivoVirtual(index) {
  const idNum = (index + 1).toString().padStart(3, '0');
  const deviceId = `DEV-${idNum}`;
  const topic = `${CONFIG.TOPIC_PREFIX}/dev_${idNum}`;
  const deviceType = TYPES[index % TYPES.length];
  
  // Cada dispositivo tem sua "personalidade" elétrica
  let basePower = 2000 + (Math.random() * 8000); 
  let tick = Math.random() * 100; // Começa em ponto diferente da onda
  let isOnline = true;

  // 1. CRIAR CONEXÃO EXCLUSIVA PARA ESTE DISPOSITIVO
  const client = mqtt.connect(CONFIG.BROKER_URL, {
    clientId: `sim_client_${deviceId}_${Math.random().toString(16).slice(2)}`,
    username: CONFIG.USERNAME,
    password: CONFIG.PASSWORD,
    connectTimeout: 10000,
    reconnectPeriod: 5000, // Tenta reconectar se cair
  });

  client.on('connect', () => {
    // console.log(`✅ [${deviceId}] Conectado e Operante.`);
    isOnline = true;
  });

  client.on('error', (err) => {
    // console.error(`❌ [${deviceId}] Erro: ${err.message}`);
    isOnline = false;
  });

  client.on('offline', () => {
    isOnline = false;
  });

  // 2. LOOP DE ENVIO DESSE DISPOSITIVO (Intervalo aleatório entre 4s e 6s)
  // Isso evita que todos mandem dados EXATAMENTE ao mesmo tempo (efeito rajada)
  const intervalMs = 4000 + (Math.random() * 2000);

  setInterval(() => {
    if (!isOnline) return;

    tick += 0.1;
    // Simula física (Onda senoidal + Ruído)
    const ruido = (Math.random() * 100) - 50;
    const variacao = Math.sin(tick) * (basePower * 0.15);
    let power = basePower + variacao + ruido;
    
    // Payload Individual
    const payload = {
      timestamp: Date.now(),
      device_id: deviceId,
      type: deviceType,
      status: 'NORMAL',
      telemetry: {
        power_w: parseFloat(power.toFixed(1)),
        voltage_v: parseFloat((220 + Math.sin(tick*3)*2).toFixed(1)),
        temp_c: parseFloat((40 + (power/500)).toFixed(1))
      }
    };

    client.publish(topic, JSON.stringify(payload), { qos: 0 }, (err) => {
      if (err) console.error(`⚠️ [${deviceId}] Falha envio.`);
      else {
        // Log visual mais limpo: só imprime 1 a cada 10 envios ou se for o DEV-001
        if (index === 0) {
            console.log(`📡 [${deviceId}] Enviou: ${power.toFixed(0)}W (Monitorando...)`);
        }
      }
    });

  }, intervalMs);
}

// ============================================================================
// INICIALIZAÇÃO EM CASCATA (Para não travar a CPU na partida)
// ============================================================================
console.log(`Iniciando ${CONFIG.NUM_DEVICES} dispositivos com intervalo de 200ms entre conexões...`);

for (let i = 0; i < CONFIG.NUM_DEVICES; i++) {
  setTimeout(() => {
    criarDispositivoVirtual(i);
    process.stdout.write(`+`); // Barra de progresso visual
  }, i * 200); // Liga um a cada 200ms para não derrubar a internet na largada
}

setTimeout(() => {
  console.log('\n\n✅ Todos os dispositivos iniciados! O log abaixo mostrará apenas o DEV-001 para não poluir.\n');
}, CONFIG.NUM_DEVICES * 200 + 1000);
