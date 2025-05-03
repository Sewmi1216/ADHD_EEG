import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type WebSocketContextType = {
  sendMessage: (msg: any) => void;
  addMessageListener: (listener: (msg: any) => void) => () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const listeners = useRef<((msg: any) => void)[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.135.250:8765');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      listeners.current.forEach((listener) => listener(msg));
    };

    ws.onerror = (err) => console.error('❌ WebSocket error', err);
    ws.onclose = () => console.log('🔌 WebSocket closed');

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (msg: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const addMessageListener = (listener: (msg: any) => void) => {
    listeners.current.push(listener);
    return () => {
      listeners.current = listeners.current.filter((l) => l !== listener);
    };
  };

  return (
    <WebSocketContext.Provider value={{ sendMessage, addMessageListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};
