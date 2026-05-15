/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REACT HOOKS - Firebase v7 Real-Time Sync İçin
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Bu hooks'lar React bileşenlerinde kullanılacak
 * Borsa, oyuncu bakiyesi, tarımlar gibi verileri ANINDA güncellemek için
 */

import React, { useEffect, useState } from 'react';

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Hook #1: useGlobalState - Borsa, Vergi, Yasalar Dinleme
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Örnek: const { stockMarket, taxRates } = useGlobalState();
 */
export function useGlobalState() {
  const [globalState, setGlobalState] = useState({
    stockMarket: JSON.parse(localStorage.getItem('rep_stockMarket') || '{}'),
    taxRates: JSON.parse(localStorage.getItem('rep_taxRates') || '{}'),
    activeLaws: JSON.parse(localStorage.getItem('rep_activeLaws') || '[]'),
    treasury: JSON.parse(localStorage.getItem('rep_treasury') || '0'),
  });

  useEffect(() => {
    // Borsa güncellenmişse
    const handleStockUpdate = () => {
      setGlobalState((prev) => ({
        ...prev,
        stockMarket: JSON.parse(localStorage.getItem('rep_stockMarket') || '{}'),
      }));
    };

    // Vergi oranları güncellenmişse
    const handleTaxUpdate = () => {
      setGlobalState((prev) => ({
        ...prev,
        taxRates: JSON.parse(localStorage.getItem('rep_taxRates') || '{}'),
      }));
    };

    // Yasalar güncellenmişse
    const handleLawsUpdate = () => {
      setGlobalState((prev) => ({
        ...prev,
        activeLaws: JSON.parse(localStorage.getItem('rep_activeLaws') || '[]'),
      }));
    };

    // Hazine güncellenmişse
    const handleTreasuryUpdate = () => {
      setGlobalState((prev) => ({
        ...prev,
        treasury: JSON.parse(localStorage.getItem('rep_treasury') || '0'),
      }));
    };

    window.addEventListener('stock-market-updated', handleStockUpdate);
    window.addEventListener('tax-rates-updated', handleTaxUpdate);
    window.addEventListener('laws-updated', handleLawsUpdate);
    window.addEventListener('treasury-updated', handleTreasuryUpdate);

    return () => {
      window.removeEventListener('stock-market-updated', handleStockUpdate);
      window.removeEventListener('tax-rates-updated', handleTaxUpdate);
      window.removeEventListener('laws-updated', handleLawsUpdate);
      window.removeEventListener('treasury-updated', handleTreasuryUpdate);
    };
  }, []);

  return globalState;
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Hook #2: useUserData - Oyuncu Profili, Envanteri, Tarımları
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Örnek: const { profile, inventory, farms, finances } = useUserData();
 */
export function useUserData() {
  const [userData, setUserData] = useState({
    profile: JSON.parse(localStorage.getItem('rep_userProfile') || '{}'),
    inventory: JSON.parse(localStorage.getItem('rep_userInventory') || '{}'),
    farms: JSON.parse(localStorage.getItem('rep_userFarms') || '[]'),
    finances: JSON.parse(localStorage.getItem('rep_userFinances') || '{}'),
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserData((prev) => ({
        ...prev,
        profile: JSON.parse(localStorage.getItem('rep_userProfile') || '{}'),
      }));
    };

    const handleInventoryUpdate = () => {
      setUserData((prev) => ({
        ...prev,
        inventory: JSON.parse(localStorage.getItem('rep_userInventory') || '{}'),
      }));
    };

    const handleFarmsUpdate = () => {
      setUserData((prev) => ({
        ...prev,
        farms: JSON.parse(localStorage.getItem('rep_userFarms') || '[]'),
      }));
    };

    const handleFinancesUpdate = () => {
      setUserData((prev) => ({
        ...prev,
        finances: JSON.parse(localStorage.getItem('rep_userFinances') || '{}'),
      }));
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('user-inventory-updated', handleInventoryUpdate);
    window.addEventListener('user-farms-updated', handleFarmsUpdate);
    window.addEventListener('user-finances-updated', handleFinancesUpdate);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('user-inventory-updated', handleInventoryUpdate);
      window.removeEventListener('user-farms-updated', handleFarmsUpdate);
      window.removeEventListener('user-finances-updated', handleFinancesUpdate);
    };
  }, []);

  return userData;
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Hook #3: usePresence - Çevrimiçi Oyuncuları Takip Et
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Örnek: const { onlineCount, onlineList } = usePresence();
 */
export function usePresence() {
  const [presence, setPresence] = useState({
    onlineCount: parseInt(localStorage.getItem('rep_onlineCount') || '0'),
    onlineList: JSON.parse(localStorage.getItem('rep_onlineList') || '[]'),
  });

  useEffect(() => {
    const handlePresenceUpdate = (event) => {
      const { count, players } = event.detail;
      setPresence({
        onlineCount: count,
        onlineList: players,
      });
    };

    window.addEventListener('presence-updated', handlePresenceUpdate);

    return () => window.removeEventListener('presence-updated', handlePresenceUpdate);
  }, []);

  return presence;
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * Hook #4: useOptimisticAction - Hemen Göster, Sonra Sinkronize
 * ─────────────────────────────────────────────────────────────────────────
 * 
 * Örnek:
 *   const { execute, isLoading } = useOptimisticAction();
 *   await execute('harvest', { money: 5000 }, async () => {
 *     // Firebase'e kaydet
 *   });
 */
export function useOptimisticAction() {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (actionName, localData, serverUpdate) => {
    try {
      setIsLoading(true);

      // 1. Yerel state anında güncelle
      Object.entries(localData).forEach(([key, value]) => {
        localStorage.setItem('rep_' + key, JSON.stringify(value));
      });
      window.dispatchEvent(new Event('optimistic-update'));

      // 2. Arka planda Firebase'e gönder
      if (serverUpdate && typeof serverUpdate === 'function') {
        await serverUpdate();
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[OptimisticUI] Hata:', error);
      window.dispatchEvent(new Event('optimistic-rollback'));
      setIsLoading(false);
      return false;
    }
  };

  return { execute, isLoading };
}


/**
 * Hook #5: useRealtimeChannel - Firebase / Socket.io / WebSocket fallback
 */
export function useRealtimeChannel({
  channel = 'global',
  socketUrl = '',
  wsUrl = '',
  eventName = 'sync:update',
  enabled = true,
} = {}) {
  const [status, setStatus] = useState('idle');
  const [lastPayload, setLastPayload] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;

    let teardown = () => {};

    const broadcastHandler = (event) => {
      if (event?.detail?.channel && event.detail.channel !== channel) return;
      setLastPayload(event?.detail || null);
      setStatus('connected');
    };

    window.addEventListener(eventName, broadcastHandler);

    if (window.io && socketUrl) {
      try {
        const socket = window.io(socketUrl, { transports: ['websocket', 'polling'] });
        socket.on('connect', () => setStatus('connected'));
        socket.on('disconnect', () => setStatus('disconnected'));
        socket.on(channel, (payload) => setLastPayload(payload));
        teardown = () => socket.close();
      } catch (err) {
        console.warn('[Realtime] Socket.io fallback kullanılacak:', err);
      }
    } else if (wsUrl) {
      try {
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => setStatus('connected');
        ws.onclose = () => setStatus('disconnected');
        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (!parsed?.channel || parsed.channel === channel) setLastPayload(parsed);
          } catch {
            setLastPayload({ raw: event.data, channel });
          }
        };
        teardown = () => ws.close();
      } catch (err) {
        console.warn('[Realtime] WebSocket açılamadı:', err);
      }
    }

    return () => {
      window.removeEventListener(eventName, broadcastHandler);
      teardown();
    };
  }, [channel, enabled, eventName, socketUrl, wsUrl]);

  return { status, lastPayload };
}

/**
 * Hook #6: useTypingStatus - chat "yazıyor" göstergesi
 */
export function useTypingStatus(channel = 'global') {
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    const key = `typing:${channel}`;
    const handler = (event) => {
      if (event?.detail?.key !== key) return;
      const users = Array.isArray(event?.detail?.users) ? event.detail.users : [];
      setTypingUsers(users);
    };

    window.addEventListener('typing-updated', handler);
    return () => window.removeEventListener('typing-updated', handler);
  }, [channel]);

  return typingUsers;
}
