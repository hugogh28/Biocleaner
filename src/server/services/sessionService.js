import crypto from 'crypto';

export function createSessionService() {
  const sessions = new Map(); // sessionId -> nickname

  function createSession(nickname) {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, nickname);
    return sessionId;
  }

  function getNickname(sessionId) {
    return sessions.get(sessionId) || null;
  }

  function removeSession(sessionId) {
    return sessions.delete(sessionId);
  }

  return {
    createSession,
    getNickname,
    removeSession
  };
}
