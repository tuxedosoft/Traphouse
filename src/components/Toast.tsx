"use client";

import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast after a brief delay for animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      clearTimeout(showTimer);
    };
  }, []);

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      padding: '16px 20px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1000,
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      userSelect: 'none' as const
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        };
      case 'error':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        };
      case 'info':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        };
      case 'warning':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      default:
        return '';
    }
  };

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade out animation
  };

  return (
    <div 
      style={getToastStyles()}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(0) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      tabIndex={0}
      role="button"
      aria-label="Dismiss notification"
    >
      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
} 