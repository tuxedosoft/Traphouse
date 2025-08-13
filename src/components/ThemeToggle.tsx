"use client";

import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'relative',
        width: '50px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: 'white',
          transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: theme === 'dark' ? '#2d3748' : '#f7fafc',
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </button>
  );
} 