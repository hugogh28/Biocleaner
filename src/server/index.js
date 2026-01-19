import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Servicios (factory functions)
import { createUserService } from './services/userService.js';
import { createMessageService } from './services/messageService.js';
import { createConnectionService } from './services/connectionService.js';
import { createSessionService } from './services/sessionService.js';
// Controladores (factory functions)
import { createUserController } from './controllers/userController.js';
import { createMessageController } from './controllers/messageController.js';
import { createConnectionController } from './controllers/connectionController.js';

// Rutas (factory functions)
import { createUserRoutes } from './routes/users.js';
import { createMessageRoutes } from './routes/messages.js';
import { createConnectionRoutes } from './routes/connections.js';

import { createMatchmakingService } from './services/matchmakingService.js';
import { createGameRoomService } from './services/gameRoomService.js';

import { WebSocketServer } from 'ws';
import { createServer } from 'http';


// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== CONFIGURACIÓN DE DEPENDENCIAS ====================
// Aquí se construye toda la cadena de dependencias de la aplicación
// Esto facilita el testing al permitir inyectar mocks en cualquier nivel

// 1. Crear servicios (capa de datos)
const userService = createUserService();
const messageService = createMessageService(userService);  // messageService depende de userService
const connectionService = createConnectionService();
const sessionService = createSessionService();
// 2. Crear controladores inyectando servicios (capa de lógica)
const userController = createUserController(userService);
const messageController = createMessageController(messageService);
const connectionController = createConnectionController(connectionService);

// 3. Crear routers inyectando controladores (capa de rutas)
const userRoutes = createUserRoutes(userController);
const messageRoutes = createMessageRoutes(messageController);
const connectionRoutes = createConnectionRoutes(connectionController);

const gameRoomService = createGameRoomService();
const matchmakingService = createMatchmakingService(gameRoomService);


// ==================== SERVIDOR ====================

const app = express();
const PORT = 3000;

// ==================== MIDDLEWARE ====================

// Parse JSON bodies
app.use(express.json());

// Log de peticiones (simple logger)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.post('/api/login', (req, res) => {
  const { nickname } = req.body;

  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ error: 'nickname requerido' });
  }

  const cleanNick = nickname.trim();

  // Crear o recuperar usuario
  const user = userService.createUser(cleanNick);
  
  const sessionId = sessionService.createSession(cleanNick);

  console.log('[LOGIN]', cleanNick, 'session:', sessionId, 'games:', user.gamesPlayed);

  res.json({
    sessionId,
    nickname: cleanNick,
    gamesPlayed: user.gamesPlayed
  });
});

app.get('/api/game/stats', (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId requerido' });
  }

  const nickname = sessionService.getNickname(sessionId);
  if (!nickname) {
    return res.status(401).json({ error: 'sesión inválida' });
  }

  // Obtener estadísticas usando el servicio
  const stats = userService.getStats(nickname);
  
  if (!stats) {
    // Si no existe el usuario, crear uno nuevo con 0 partidas
    const newUser = userService.createUser(nickname);
    return res.json({
      nickname: newUser.nickname,
      gamesPlayed: newUser.gamesPlayed
    });
  }

  res.json(stats);
});

app.put('/api/game/start', (req, res) => {
  const { sessionId } = req.body;

  const nickname = sessionService.getNickname(sessionId);
  if (!nickname) {
    return res.status(401).json({ error: 'sesión inválida' });
  }

  // Usar el userService correctamente
  let user = userService.getUserByNickname(nickname);
  
  if (!user) {
    // Crear usuario correctamente - solo pasando el nickname
    user = userService.createUser(nickname);
  }

  if (user.state === 'idle') {
    user.gamesPlayed += 1;
    user.state = 'playing';
  }

  // Incrementar contador usando el método del servicio
  userService.incrementGamesPlayed(nickname);

  console.log('[GAME START]', nickname, user.gamesPlayed);

  res.json({ gamesPlayed: user.gamesPlayed });
});

app.put('/api/game/end', (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId requerido' });
  }

  const nickname = sessionService.getNickname(sessionId);
  if (!nickname) {
    return res.status(401).json({ error: 'sesión inválida' });
  }

  const user = userService.getUserByNickname(nickname);
  if (user) {
    user.state = 'idle';
  }

  console.log('[GAME END]', nickname);

  res.json({ ok: true });
});


// CORS simple (permitir todas las peticiones)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Servir archivos estáticos del juego (dist/)
app.use(express.static(path.join(__dirname, '../../dist')));

// ==================== RUTAS ====================

app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/connected', connectionRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA Fallback - Servir index.html para todas las rutas que no sean API
app.use((req, res, next) => {
  // Si la petición es a /api/*, pasar al siguiente middleware (404 para APIs)
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }

  // Para cualquier otra ruta, servir el index.html del juego
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// ==================== WEBSOCKET SERVER ====================


// Servidor WebSocket en puerto 3000
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WS] Cliente conectado al WebSocket');

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      console.error('[WS] Mensaje inválido:', msg);
      return;
    }

    console.log('[WS] Mensaje recibido:', data.type);

    // Manejar diferentes tipos de mensajes
    switch(data.type) {
      case 'joinQueue':
        matchmakingService.joinQueue(ws);
        break;

      case 'leaveQueue':
        matchmakingService.leaveQueue(ws);
        break;
      case 'syncObjects':
        gameRoomService.handleObjectsPosition(ws,data);
        break;

      case 'delObjects':
        gameRoomService.handleDeleteObjects(ws,data);
        break;
      case 'playerMove':
        gameRoomService.handlePlayerMove(ws, data);
        break;
      case 'powerUpPickup':
        gameRoomService.handlePowerUpPickup(ws, data);
        break;

      case 'stickyHit':
        gameRoomService.handleStickyHit(ws, data);
        break;

      case 'scoreUpdate':
        gameRoomService.handleScoreUpdate(ws, data);
        break;
      
      case 'invertControls':
        gameRoomService.handleInvertedControls(ws,data);
        break;
        
      default:
        console.log('[WS] Tipo de mensaje desconocido:', data.type);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`[WS] Cliente desconectado - Code: ${code}, Reason: ${reason}`);
    gameRoomService.handleDisconnect(ws);
    matchmakingService.leaveQueue(ws);
  });

  ws.on('error', (error) => {
    console.error('[WS] Error en WebSocket:', error);
  });
});

console.log('WebSocket escuchando en ws://localhost:3001');

// ==================== INICIO DEL SERVIDOR ====================

server.listen(PORT, () => {
  console.log('========================================');
  console.log('  SERVIDOR DE CHAT PARA VIDEOJUEGO');
  console.log('========================================');
  console.log(`  Servidor corriendo en http://localhost:${PORT}`);
  console.log(`  `);
  console.log(`  🎮 Juego: http://localhost:${PORT}`);
  console.log(`   Websocket disponible en ws://localhost:${PORT}`);
  console.log(`  `);
  console.log(`  API Endpoints disponibles:`);
  console.log(`   - GET    /health`);
  console.log(`   - GET    /api/connected`);
  console.log(`   - GET    /api/users`);
  console.log(`   - POST   /api/users`);
  console.log(`   - GET    /api/users/:id`);
  console.log(`   - PUT    /api/users/:id`);
  console.log(`   - DELETE /api/users/:id`);
  console.log(`   - GET    /api/messages`);
  console.log(`   - POST   /api/messages`);
  console.log('========================================\n');
});

