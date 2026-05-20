// Socket.IO Client - Multiplayer Realtime Sync
let socket = null;
let socketConnected = false;

export function initSocket(serverUrl = 'https://understate1.onrender.com') {
  if (socket) return socket;
  
  socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });
  
  // Bağlantı olayları
  socket.on('connect', () => {
    socketConnected = true;
    console.log('✓ Socket.IO bağlandı:', socket.id);
    window.dispatchEvent(new CustomEvent('socket-connected', { detail: { socketId: socket.id } }));
  });
  
  socket.on('disconnect', () => {
    socketConnected = false;
    console.log('✗ Socket.IO bağlantı kesildi');
    window.dispatchEvent(new CustomEvent('socket-disconnected'));
  });
  
  socket.on('reconnect', () => {
    socketConnected = true;
    console.log('↻ Socket.IO yeniden bağlandı');
    window.dispatchEvent(new CustomEvent('socket-reconnected'));
  });
  
  // Chat mesajları
  socket.on('chat', (data) => {
    console.log('💬 Yeni mesaj:', data);
    try {
      const channel = data.channel || 'globalChat';
      let current = JSON.parse(localStorage.getItem('rep_' + channel) || '[]');
      if (!Array.isArray(current)) current = [];
      
      // Duplikat kontrol
      if (!current.find(m => m.id === data.id)) {
        current.push({
          id: data.id || Math.random().toString(36).slice(2),
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp || Date.now(),
          channel: channel
        });
        localStorage.setItem('rep_' + channel, JSON.stringify(current));
        window.dispatchEvent(new CustomEvent('fb-sync', {
          detail: { key: channel, value: current }
        }));
      }
    } catch (e) {
      console.warn('Chat mesaj hatası:', e);
    }
  });
  
  // Oyuncu durumu güncellemeleri
  socket.on('playerUpdate', (data) => {
    console.log('👤 Oyuncu güncellemesi:', data);
    try {
      const updates = JSON.parse(localStorage.getItem('rep_playerUpdates') || '{}');
      updates[data.userId] = {
        ...data,
        lastUpdate: Date.now()
      };
      localStorage.setItem('rep_playerUpdates', JSON.stringify(updates));
      window.dispatchEvent(new CustomEvent('player-updated', {
        detail: { userId: data.userId, data: data }
      }));
    } catch (e) {
      console.warn('Oyuncu güncellemesi hatası:', e);
    }
  });
  
  // Online oyuncu sayısı
  socket.on('onlineCount', (count) => {
    console.log('👥 Online oyuncu sayısı:', count);
    localStorage.setItem('rep_onlineCount', JSON.stringify(count));
    window.dispatchEvent(new CustomEvent('fb-sync', {
      detail: { key: 'onlineCount', value: count }
    }));
  });
  
  // Genel broadcast
  socket.on('broadcast', (data) => {
    console.log('📢 Broadcast:', data);
    window.dispatchEvent(new CustomEvent('socket-broadcast', {
      detail: data
    }));
  });
  
  return socket;
}

export function getSocket() {
  return socket;
}

export function isConnected() {
  return socketConnected && socket?.connected;
}

export function sendChat(channel, message, sender) {
  if (!socket) return;
  socket.emit('chat', {
    id: Math.random().toString(36).slice(2),
    channel,
    message,
    sender,
    timestamp: Date.now()
  });
}

export function sendPlayerUpdate(userId, action, data) {
  if (!socket) return;
  socket.emit('playerUpdate', {
    userId,
    action,
    data,
    timestamp: Date.now()
  });
}

export function broadcastEvent(eventName, data) {
  if (!socket) return;
  socket.emit('broadcast', {
    event: eventName,
    data,
    timestamp: Date.now()
  });
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketConnected = false;
  }
}
