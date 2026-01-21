// src/components/NotificationBanner.jsx
// ======================================================
// Pop-up banner til notifikationer (fx nye beskeder)
// ======================================================
import { useState, useEffect } from 'react';

function NotificationBanner({ message, type = 'info', duration = 4000, onClose, onClick }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    chat: '#2196f3',
  }[type] || '#2196f3';

  const handleClick = () => {
    setIsVisible(false);
    onClick?.();
    onClose?.();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: bgColor,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 999,
        animation: 'slideIn 0.3s ease-in-out',
        maxWidth: '400px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateX(-4px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
    >
      {message}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
          onClose?.();
        }}
        style={{
          marginLeft: '12px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0',
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default NotificationBanner;
