const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "ProjectGrid IoT - Dashboard",
    icon: path.join(__dirname, 'public', 'favicon.ico'), // Ajuste se tiver ícone
    autoHideMenuBar: true,
  });

  // No executável, abrimos direto a rota de login
  mainWindow.loadURL('http://localhost:3000/login');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicia o seu servidor customizado (Next.js + Broker MQTT Aedes)
function startServer() {
  console.log("Iniciando servidor ProjectGrid...");
  
  // Executa o seu server.js usando o node
  serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  serverProcess.on('error', (err) => {
    console.error('Falha ao iniciar o processo do servidor:', err);
  });
}

app.on('ready', () => {
  startServer();
  
  // Aguarda um pouco para o Next.js e o Broker subirem
  // Em uma versão final, podemos fazer uma checagem real de porta
  setTimeout(createWindow, 5000);
});

app.on('window-all-closed', () => {
  // Mata o processo do servidor ao fechar o app para não deixar portas presas
  if (serverProcess) {
    console.log("Encerrando servidor...");
    serverProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
