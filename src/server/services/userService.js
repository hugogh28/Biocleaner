/**
 * Servicio de gestión de usuarios usando closures
 * Este servicio mantiene el estado de los usuarios en memoria
 * y proporciona métodos para realizar operaciones CRUD
 */

export function createUserService() {
  let users = [];
  let nextId = 1;

  function createUser(nickname) {
    const existingUser = users.find(u => u.nickname === nickname);
    if (existingUser) {
      return existingUser;
    }

    const newUser = {
      id: String(nextId),
      nickname,
      gamesPlayed: 0,
      state: 'idle',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    nextId++;

    return newUser;
  }

  function getUserByNickname(nickname) {
    return users.find(u => u.nickname === nickname) || null;
  }

  function incrementGamesPlayed(nickname) {
    const user = getUserByNickname(nickname);
    if (!user) return null;

    user.gamesPlayed += 1;
    return user.gamesPlayed;
  }

  function getStats(nickname) {
    const user = getUserByNickname(nickname);
    if (!user) return null;

    return {
      nickname: user.nickname,
      gamesPlayed: user.gamesPlayed
    };
  }

  return {
    createUser,
    getUserByNickname,
    incrementGamesPlayed,
    getStats
  };
}
