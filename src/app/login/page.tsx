"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DynamicTitle from '../../components/DynamicTitle';
import ThemeToggle from '../../components/ThemeToggle';

export default function LoginPage({ pageTitle = 'Login' }: { pageTitle?: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      login(); // Call the login function to update authentication state
      router.push('/admin'); // Redirect to admin page on successful login
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

    return (
    <>
      <DynamicTitle section="Admin Login" />
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--gradient-primary)',
        padding: '20px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px'
        }}>
          <ThemeToggle />
        </div>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%',
          padding: '40px', 
          background: 'var(--bg-card)',
          borderRadius: '16px', 
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '10px',
              fontSize: '28px',
              fontWeight: '600'
            }}>Traphouse</h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '14px',
              margin: '0'
            }}>Enter your credentials to access the admin panel</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="username" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500'
              }}>Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid var(--input-border)', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                }}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label htmlFor="password" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500'
              }}>Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid var(--input-border)', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                }}
                placeholder="Enter your password"
                required
              />
            </div>
            
            {error && (
              <div style={{ 
                background: 'var(--gradient-danger)', 
                border: '1px solid var(--button-danger)', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ 
                  color: 'white', 
                  margin: '0',
                  fontSize: '14px'
                }}>{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: 'var(--gradient-primary)',
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: '600',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: 'var(--shadow)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
}