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

    //Enviar sincronización de la puntuación al jugador contrario
    /*const scoreMsg = {
      type: 'scoreSync',
      endAt
    };*/
    player1Ws.send(JSON.stringify(timerMsg));
    player2Ws.send(JSON.stringify(timerMsg));

    player1Ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log('Recibido mensaje de puntuación:', data);

      if(data.type === 'scoreUpdate'){ //Probablemente haga falta sustituirlo por un switch debido a que hay que contemplar más tipos de mensajes
        handleScoreUpdate(player1Ws, data);
      }
    };

    player1Ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log('Recibido mensaje de puntuación:', data);

      if(data.type === 'scoreUpdate'){
        handleScoreUpdate(player1Ws, data);
      }
    };

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

  function handleScoreUpdate(ws, data){
      const currentRoom = rooms.get(ws.roomId);
      if(!currentRoom||!currentRoom.active) return;

      const player = currentRoom.player1.ws === ws ? currentRoom.player1 : currentRoom.player2;

      console.log(`Puntuación antes de actualizar para ${player.score}: ${data.score}`);

      player.score = data.score;

      console.log(`Puntuación actualizada para ${player.score}`);
      
      const msg = {
        
        type: 'scoreUpdate',
        player1Score: currentRoom.player1.score,
        player2Score: currentRoom.player2.score
      };

      currentRoom.player1.ws.send(JSON.stringify(msg));
      currentRoom.player1.ws.send(JSON.stringify(msg));
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
    handleScoreUpdate,
    handleDisconnect,
    getActiveRoomCount
  };
}