'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, type, message, duration };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const colors = {
    success: 'bg-green-600/90 border-green-500',
    error: 'bg-red-600/90 border-red-500',
    info: 'bg-blue-600/90 border-blue-500',
    warning: 'bg-yellow-600/90 border-yellow-500'
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl border-2 backdrop-blur-md shadow-2xl min-w-[300px] max-w-md animate-slide-in ${colors[toast.type]}`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <span className="text-2xl">{icons[toast.type]}</span>
      <p className="flex-1 text-white font-semibold text-sm">{toast.message}</p>
      <button onClick={onClose} className="text-white/70 hover:text-white transition text-xl leading-none">
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}