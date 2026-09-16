import React, { createContext, useContext, useState, useCallback } from 'react';
import GameSnackbar from '../components/GameSnackbar';
import { playSuccess, playError, playAlert } from '../utils/sound';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'success', message, title, duration = 3800 }) => {
    const id = Date.now() + Math.random();
    
    // Putar efek audio sesuai tipe notifikasi
    if (type === 'error') {
      playError();
    } else if (type === 'alert' || type === 'warning' || type === 'info') {
      playAlert();
    } else {
      playSuccess();
    }

    setToasts((prev) => [...prev.slice(-3), { id, type, message, title, duration }]);
  }, []);

  const toast = {
    success: (message, title = 'OPERATION COMPLETED') => {
      addToast({ type: 'success', message, title });
    },
    error: (message, title = 'SYSTEM ERROR') => {
      addToast({ type: 'error', message, title });
    },
    alert: (message, title = 'TACTICAL ALERT') => {
      addToast({ type: 'alert', message, title });
    },
    warning: (message, title = 'WARNING') => {
      addToast({ type: 'warning', message, title });
    },
    info: (message, title = 'SYSTEM NOTICE') => {
      addToast({ type: 'info', message, title });
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Container Toast Stacking di Kanan Atas */}
      <div 
        className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-3 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <GameSnackbar toast={item} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
