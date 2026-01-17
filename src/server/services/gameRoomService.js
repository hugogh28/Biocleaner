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

      // TIMER AUTORITATIVO
      endAt
    };

    rooms.set(roomId, room);

    player1Ws.roomId = roomId;
    player2Ws.roomId = roomId;

    // Enviar sincronización del temporizador a ambos jugadores
    const timerMsg = {
      type: 'timerSync',
      endAt
    };

    player1Ws.send(JSON.stringify(timerMsg));
    player2Ws.send(JSON.stringify(timerMsg));

    // Final de partida decidido por el servidor
    setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (!currentRoom || !currentRoom.active) return;

      currentRoom.active = false;

      const gameOverMsg = {
        type: 'gameOverTime',
        player1Score: currentRoom.player1.score,
        player2Score: currentRoom.player2.score
      };

      currentRoom.player1.ws.send(JSON.stringify(gameOverMsg));
      currentRoom.player2.ws.send(JSON.stringify(gameOverMsg));

      rooms.delete(roomId);
    }, GAME_DURATION_MS);

    return roomId;
  }

  function getRoom(roomId) {
    return rooms.get(roomId);
  }

  function handlePaddleMove(ws, y) {
    const room = rooms.get(ws.roomId);
    if (!room || !room.active) return;

    const opponent =
      room.player1.ws === ws ? room.player2.ws : room.player1.ws;

    if (opponent.readyState === 1) {
      opponent.send(JSON.stringify({
        type: 'playerUpdate',
        y
      }));
    }
  }

  function handleDisconnect(ws) {
    const room = rooms.get(ws.roomId);
    if (!room) return;

    if (room.active) {
      const opponent =
        room.player1.ws === ws ? room.player2.ws : room.player1.ws;

      if (opponent.readyState === 1) {
        opponent.send(JSON.stringify({
          type: 'playerDisconnected'
        }));
      }
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
    handlePaddleMove,
    handleDisconnect,
    getActiveRoomCount
  };
}