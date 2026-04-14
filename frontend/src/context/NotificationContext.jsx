import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {notifications.map((n) => (
          <Snackbar 
            key={n.id} 
            {...n} 
            onClose={() => removeNotification(n.id)} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

function Snackbar({ message, type, onClose }) {
  const styles = {
    success: 'bg-green-600 border-green-400',
    error: 'bg-red-600 border-red-400',
    info: 'bg-[var(--color-primary)] border-[var(--color-accent)]'
  };

  return (
    <div className={`pointer-events-auto px-6 py-3 rounded-lg border shadow-2xl animate-bounce-in min-w-[280px] text-center ${styles[type] || styles.info}`}>
      <p className="text-white font-semibold text-sm">{message}</p>
    </div>
  );
}
