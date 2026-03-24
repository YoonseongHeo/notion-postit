import React, { useEffect, useState } from 'react';

export default function Toast({ message, duration = 1500, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--toast-bg)', color: 'var(--toast-text)',
      padding: '4px 14px', borderRadius: 6, fontSize: 11.5,
      zIndex: 100, maxWidth: 300, textAlign: 'center',
      animation: visible ? 'toast-in 0.15s ease' : 'toast-out 0.2s ease forwards',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  );
}
