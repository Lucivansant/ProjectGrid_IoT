#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// ==========================================
// 1. CONFIGURAÇÕES DE REDE (WOKWI)
// ==========================================
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// ==========================================
// 2. CONFIGURAÇÕES DO HIVEMQ CLOUD
// ==========================================
// Coloque aqui a URL que pegamos no painel (SEM wss://, apenas o domínio)
const char* mqtt_server = "07f7bb0a81a54b7d83d65e8ab6e41091.s1.eu.hivemq.cloud";

// PORTA PARA ESP32 (SSL/TLS)
// Nota: No site usamos 8884 (WSS), no ESP32 usamos 8883 (MQTTS)
const int mqtt_port = 8883;

// SUAS CREDENCIAIS (Crie em "Access Management" no HiveMQ)
const char* mqtt_user = "admin";    // <-- TROQUE PELO SEU
const char* mqtt_pass = "senha123"; // <-- TROQUE PELA SUA

// Tópico para publicar
const char* topic = "projectgrid/test";

// ==========================================

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Conecta ao WiFi
  Serial.print("Conectando ao WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado!");

  // Configuração Segura (SSL)
  // setInsecure() permite conectar sem validar o certificado raiz.
  // Ideal para testes rápidos no Wokwi/ESP32 sem baixar certificado CA.
  espClient.setInsecure();
  
  client.setServer(mqtt_server, mqtt_port);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conectar ao Broker MQTT...");
    
    // ID Aleatório para não conflitar
    String clientId = "ESP32-Wokwi-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("Conectado!");
    } else {
      Serial.print("Falha! rc=");
      Serial.print(client.state());
      Serial.println(" Tentando novamente em 5s...");
      delay(5000);
    }
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // ENVIO DE DADOS (Simulação de Sensores)
  static unsigned long lastMsg = 0;
  if (millis() - lastMsg > 3000) { // A cada 3 segundos
    lastMsg = millis();
    
    float voltagem = random(2100, 2300) / 10.0; // 210.0 a 230.0 V
    float corrente = random(10, 50) / 10.0;     // 1.0 a 5.0 A
    float potencia = voltagem * corrente;
    
    // JSON formatado
    String payload = "{";
    payload += "\"timestamp\": " + String(millis()) + ",";
    payload += "\"sensors\": {";
    payload += "\"voltagem\": " + String(voltagem) + ",";
    payload += "\"corrente\": " + String(corrente) + ",";
    payload += "\"potencia\": " + String(potencia);
    payload += "}";
    payload += "}";

    Serial.print("Enviando: ");
    Serial.println(payload);
    
    client.publish(topic, payload.c_str());
  }
}
