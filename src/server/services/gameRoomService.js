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
      //Sincronización de objetos
      stickyGroup: [],
      trashGroup: [],
      powerUpGroup:[],
      spillGroup:[],
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

      const p1 = currentRoom.player1.score;
      const p2 = currentRoom.player2.score;

      let winner = 'draw'
      if (p1 > p2) winner = 'player1'
      else if (p2 < p1) winner = 'player2'

      const gameOverMsg = {
        type: 'gameOverTime',

        winner,
        player1Score: p1,
        player2Score: p2
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

      const opponent = room.player1.ws === ws ? room.player2.ws : room.player1.ws;

      if (opponent.readyState === 1) {
          opponent.send(JSON.stringify({
              type: 'playerUpdate',
              x: data.x,
              y: data.y,
              direction: data.direction,
              isMoving: data.isMoving,
              // NUEVO: Reenviar estados
              powerUpActive: data.powerUpActive,
              stickyActive: data.stickyActive
          }));
      }
  }

  function handlePowerUpPickup(ws, data) {
      const room = rooms.get(ws.roomId);
      if (!room || !room.active) return;

      const opponent = room.player1.ws === ws ? room.player2.ws : room.player1.ws;

      if (opponent.readyState === 1) {
          opponent.send(JSON.stringify({
              type: 'powerUpPickup',
              playerId: data.playerId
          }));
      }
  }

  function handleStickyHit(ws, data) {
      const room = rooms.get(ws.roomId);
      if (!room || !room.active) return;

      const opponent = room.player1.ws === ws ? room.player2.ws : room.player1.ws;

      if (opponent.readyState === 1) {
          opponent.send(JSON.stringify({
              type: 'stickyHit',
              playerId: data.playerId,
          }));
      }
  }

  function handleScoreUpdate(ws, data) {
    const currentRoom = rooms.get(ws.roomId);
    if (!currentRoom || !currentRoom.active) return;

    var player = currentRoom.player1.ws === ws ? currentRoom.player1 : currentRoom.player2;
    const playerName = currentRoom.player1.ws === ws ? 'player1' : 'player2';
    
    if (data.targetPlayer === 'player1') {
    player = currentRoom.player1;
    } else if (data.targetPlayer === 'player2') {
    player = currentRoom.player2;
    }
    
    console.log(`[SCORE UPDATE] ${playerName}: ${player.score} -> ${data.score}`);

    player.score += data.score;
    
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

  ////////////////////////////////////// SUJETO A REVISIÓN ////////////////////////////////

  function handleObjectsPosition(ws,data){
    const currentRoom = rooms.get(ws.roomId);
    if(!currentRoom||!currentRoom.active) return;

    const {objectType, x, y, size, id} = data;
    
    switch(objectType){
      case 'sticky':
        currentRoom.stickyGroup.push({
          objectType: 'sticky',
          x, y, size, id
        });
        break;
      case 'trash':
        currentRoom.trashGroup.push({
          objectType: 'trash',
          x, y, size, id
        });
        break;
      case 'powerUp':
        currentRoom.powerUpGroup.push({
          objectType: 'powerUp',
          x, y, size, id
        });
        break;
      case 'spill':
        currentRoom.spillGroup.push({
          objectType: 'spill',
          x, y, size, id
        });
        break;
    }

    const msg = {
      type: 'syncObjects',
      stickyGroup: currentRoom.stickyGroup,
      trashGroup: currentRoom.trashGroup,
      powerUpGroup: currentRoom.powerUpGroup,
      spillGroup: currentRoom.spillGroup
    };

    if(currentRoom.player1.ws.readyState === 1) {
      currentRoom.player1.ws.send(JSON.stringify(msg));
    }
    if(currentRoom.player2.ws.readyState === 1) {
      currentRoom.player2.ws.send(JSON.stringify(msg));
    }
  }

  function handleDeleteObjects(ws,data){
    const currentRoom = rooms.get(ws.roomId);
    if(!currentRoom||!currentRoom.active) return;

    const{objectType, id} = data;

    switch(objectType){
      case 'sticky':
        currentRoom.stickyGroup = currentRoom.stickyGroup.filter(obj=> obj.id !== id);
        break;
      case 'trash':
        currentRoom.trashGroup = currentRoom.trashGroup.filter(obj=> obj.id !== id);
        break;
      case 'powerUp':
        currentRoom.powerUpGroup = currentRoom.powerUpGroup.filter(obj=> obj.id !== id);
        break;
      case 'spill':
        currentRoom.spillGroup = currentRoom.spillGroup.filter(obj=> obj.id !== id);
        break;
    }

    const msg = {
      type: 'delObjects',
      objectType: objectType,
      id: id
    };

    if(currentRoom.player1.ws.readyState === 1) {
      currentRoom.player1.ws.send(JSON.stringify(msg));
    }
    if(currentRoom.player2.ws.readyState === 1) {
      currentRoom.player2.ws.send(JSON.stringify(msg));
    }
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    handleObjectsPosition,
    handleDeleteObjects,
    handlePowerUpPickup,  
    handleStickyHit,      
    getActiveRoomCount
};
}