/**
 * Script de Simulação de Dispositivos IoT.
 * Este script cria clientes MQTT virtuais que publicam dados aleatórios simulando 
 * sensores industriais reais para testes de interface e backend.
 */
const mqtt = require('mqtt');

// Função para criar um dispositivo virtual (Assíncrono)
/**
 * Cria um simulador de dispositivo individual.
 * @param {string} idLocal - Identificador do dispositivo.
 * @param {string} topico - Tópico MQTT para publicação.
 * @param {number} intervaloMs - Frequência de envio de dados em milissegundos.
 * @param {number[]} rangeTemp - Intervalo [min, max] para variação de temperatura.
 * @param {number[]} rangeUmid - Intervalo [min, max] para variação de umidade.
 */
function criarSimulador(idLocal, topico, intervaloMs, rangeTemp, rangeUmid) {
  // Conecta ao Broker Local (porta TCP 1885) com ClientID único para não derrubar os outros
  const client = mqtt.connect('mqtt://localhost:1885', {
    clientId: `simulador_${idLocal}_${Math.random().toString(16).substr(2, 6)}`
  });

  client.on('connect', () => {
    console.log(`✅ [${idLocal}] Conectado ao Broker (TCP: 1885) -> Publicando em '${topico}' a cada ${intervaloMs/1000}s`);

    // Loop Assíncrono para enviar dados
    setInterval(() => {
      // Simulação flutuante de temperatura
      const temperatura = (Math.random() * (rangeTemp[1] - rangeTemp[0]) + rangeTemp[0]).toFixed(2);
      
      // Simulação oscilante de nível de umidade/carga
      const umidade = Math.floor(Math.random() * (rangeUmid[1] - rangeUmid[0]) + rangeUmid[0]);

      const payload = JSON.stringify({
        id: idLocal,
        temp: parseFloat(temperatura),
        umidade: umidade,
        status: 'online',
        bateria: Math.floor(Math.random() * 20 + 80) + '%' // Bateria de 80 a 100%
      });

      client.publish(topico, payload, { qos: 0 }, (err) => {
        if (err) {
          console.error(`❌ [${idLocal}] Erro ao publicar:`, err);
        } else {
          console.log(`📤 [${idLocal}] ${payload}`);
        }
      });
    }, intervaloMs);
  });

  client.on('error', (err) => {
    console.error(`❌ [${idLocal}] Erro de conexão:`, err);
  });
}

// ==========================================
// INICIAR FAZENDA DE DISPOSITIVOS VIRTUAIS
// ==========================================
console.log('🚀 Iniciando Frota de Simuladores Assíncronos...\n');

// 1. Estufa (Clima Tropical, Atualização Média)
criarSimulador('dispositivo_04', 'projectgrid/dispositivo_04', 3000, [25, 30], [60, 80]);

// 2. Refrigerador de Vacinas (Frio Extremo, Atualização Lenta)
criarSimulador('dispositivo_05', 'projectgrid/dispositivo_05', 5000, [2, 6], [85, 95]);

// 3. Motor da Bomba (Temperatura Alta, Atualização Muito Rápida)
criarSimulador('dispositivo_06', 'projectgrid/dispositivo_06', 1500, [60, 85], [10, 20]);

// 4. Dispositivo genérico 01 (Temperatura ambiente, Atualização Média)
criarSimulador('dispositivo_01', 'projectgrid/dispositivo_01', 2500, [18, 28], [40, 70]);

// 5. Dispositivo genérico 02 (Temperatura levemente elevada, Atualização Rápida)
criarSimulador('dispositivo_02', 'projectgrid/dispositivo_02', 2000, [30, 50], [20, 45]);

// 6. Dispositivo genérico 03 (Temperatura fria, Atualização Lenta)
criarSimulador('dispositivo_03', 'projectgrid/dispositivo_03', 4000, [5, 15], [70, 90]);
