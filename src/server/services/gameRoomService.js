/**
 * Game Room service - manages active game rooms and game state
 */
export function createGameRoomService() {
  const rooms = new Map(); // roomId -> room data
  let nextRoomId = 1;

  const GAME_DURATION_MS = 120000; // 2 minutos

  function createRoom(player1Ws, player2Ws) {
    const roomId = `room_${nextRoomId++}`;

    const endAt = Date.now() + GAME_DURATION_MS;

    const room = {
      id: roomId,
      player1: {
        ws: player1Ws,
        score: 0
      },
      player2: {
        ws: player2Ws,
        score: 0
      },
      active: true,
      endAt
    };

    rooms.set(roomId, room);

    player1Ws.roomId = roomId;
    player2Ws.roomId = roomId;

    console.log(`[GAME ROOM] Sala ${roomId} creada. Timer ends at:`, new Date(endAt).toISOString());

    // Enviar sincronización del temporizador a ambos jugadores
    const timerMsg = {
      type: 'timerSync',
      endAt
    };

    player1Ws.send(JSON.stringify(timerMsg));
    player2Ws.send(JSON.stringify(timerMsg));

    // Final de partida decidido por el servidor
    const gameTimer = setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (!currentRoom || !currentRoom.active) return;

      console.log(`[GAME ROOM] Tiempo agotado para sala ${roomId}`);
      currentRoom.active = false;

      const gameOverMsg = {
        type: 'gameOverTime',
        player1Score: currentRoom.player1.score,
        player2Score: currentRoom.player2.score
      };

      try {
        if (currentRoom.player1.ws.readyState === 1) {
          currentRoom.player1.ws.send(JSON.stringify(gameOverMsg));
        }
        if (currentRoom.player2.ws.readyState === 1) {
          currentRoom.player2.ws.send(JSON.stringify(gameOverMsg));
        }
      } catch (error) {
        console.error('[GAME ROOM] Error enviando gameOver:', error);
      }

      rooms.delete(roomId);
    }, GAME_DURATION_MS);

    // Guardar el timer en la sala para poder cancelarlo si es necesario
    room.gameTimer = gameTimer;

    return roomId;
  }

  function getRoom(roomId) {
    return rooms.get(roomId);
  }

  function handlePlayerMove(ws, data) {
    const room = rooms.get(ws.roomId);
    if (!room || !room.active) return;

    const opponent =
      room.player1.ws === ws ? room.player2.ws : room.player1.ws;

    if (opponent.readyState === 1) {
      opponent.send(JSON.stringify({
        type: 'playerUpdate',
        x: data.x,
        y: data.y,
        direction: data.direction
      }));
    }
  }

  function handleScoreUpdate(ws, data) {
    const currentRoom = rooms.get(ws.roomId);
    if (!currentRoom || !currentRoom.active) return;

    const player = currentRoom.player1.ws === ws ? currentRoom.player1 : currentRoom.player2;
    const playerName = currentRoom.player1.ws === ws ? 'player1' : 'player2';

    console.log(`[SCORE UPDATE] ${playerName}: ${player.score} -> ${data.score}`);

    player.score = data.score;
    
    const msg = {
      type: 'scoreUpdate',
      player1Score: currentRoom.player1.score,
      player2Score: currentRoom.player2.score
    };

    // Enviar a ambos jugadores
    try {
      if (currentRoom.player1.ws.readyState === 1) {
        currentRoom.player1.ws.send(JSON.stringify(msg));
      }
      if (currentRoom.player2.ws.readyState === 1) {
        currentRoom.player2.ws.send(JSON.stringify(msg));
      }
    } catch (error) {
      console.error('[GAME ROOM] Error enviando scoreUpdate:', error);
    }
  }

  function handleDisconnect(ws) {
    if (!ws.roomId) return;

    const room = rooms.get(ws.roomId);
    if (!room) return;

    console.log(`[GAME ROOM] Jugador desconectado de sala ${ws.roomId}`);

    if (room.active) {
      const opponent =
        room.player1.ws === ws ? room.player2.ws : room.player1.ws;

      if (opponent.readyState === 1) {
        try {
          opponent.send(JSON.stringify({
            type: 'playerDisconnected'
          }));
        } catch (error) {
          console.error('[GAME ROOM] Error enviando playerDisconnected:', error);
        }
      }
    }

    // Cancelar el timer si existe
    if (room.gameTimer) {
      clearTimeout(room.gameTimer);
    }

    room.active = false;
    rooms.delete(room.id);
  }

  function getActiveRoomCount() {
    return Array.from(rooms.values()).filter(r => r.active).length;
  }

  return {
    createRoom,
    getRoom,
    handlePlayerMove,
    handleScoreUpdate,
    handleDisconnect,
    getActiveRoomCount
  };
}