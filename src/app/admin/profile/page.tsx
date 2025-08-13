"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import DynamicTitle from '../../../components/DynamicTitle';
import Toast from '../../../components/Toast';

export default function ProfilePage() {
  const { isLoggedIn, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before making any decisions
    if (authLoading) {
      return;
    }
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    setIsLoading(false);
    // Set current username (assuming admin is the default user)
    setCurrentUsername('admin');
    setNewUsername('admin');
  }, [isLoggedIn, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password confirmation
    if (newPassword && newPassword !== confirmPassword) {
      setToast({
        message: 'New passwords do not match',
        type: 'error'
      });
      return;
    }

    // Validate password length
    if (newPassword && newPassword.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUsername,
          newUsername: newUsername !== currentUsername ? newUsername : undefined,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      if (res.ok) {
        setToast({
          message: 'Profile updated successfully!',
          type: 'success'
        });
        setCurrentUsername(newUsername);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await res.json();
        setToast({
          message: errorData.error || 'Failed to update profile',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({
        message: 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || !isLoggedIn || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        {authLoading ? 'Checking authentication...' : isLoading ? 'Loading...' : 'Redirecting to login...'}
      </div>
    );
  }

  return (
    <>
      <DynamicTitle section="User Profile" />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '30px 20px',
            textAlign: 'center',
            color: 'white',
            position: 'relative'
          }}>
            <h1 style={{ 
              margin: '0', 
              fontSize: '32px',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              color: 'var(--text-white)',
              fontFamily: 'var(--font-primary)'
            }}>User Profile</h1>
            <p style={{ 
              margin: '10px 0 0 0',
              fontSize: '16px',
              opacity: '0.9'
            }}>Update your account information</p>
            
            {/* Back to Dashboard Button */}
            <Link 
              href="/admin" 
              style={{ 
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                padding: '8px 16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Content */}
          <div style={{ padding: '30px 20px' }}>
            <form onSubmit={handleUpdateProfile}>
              {/* Username Section */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '12px', 
                border: '1px solid #e9ecef',
                marginBottom: '25px' 
              }}>
                <h2 style={{ 
                  color: '#333', 
                  marginBottom: '20px',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>Username</h2>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    New Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                    }}
                  />
                </div>
              </div>

              {/* Password Section */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '25px', 
                borderRadius: '12px', 
                border: '1px solid #e9ecef',
                marginBottom: '25px' 
              }}>
                <h2 style={{ 
                  color: '#333', 
                  marginBottom: '20px',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>Password</h2>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (leave blank to keep current)"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#007bff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                    }}
                  />
                </div>
              </div>

              {/* Update Button */}
              <button
                type="submit"
                disabled={isUpdating}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  opacity: isUpdating ? 0.7 : 1,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isUpdating) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,123,255,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUpdating) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                  }
                }}
              >
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 