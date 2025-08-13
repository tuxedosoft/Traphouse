"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DynamicTitle from '../../components/DynamicTitle';
import Toast from '../../components/Toast';
import ThemeToggle from '../../components/ThemeToggle';
import './admin.css';

interface Stats {
  postCount: number;
  userCount: number;
}

interface Post {
  id: string;
  content: string;
  timestamp: string;
}

// Function to calculate time ago
function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}

export default function AdminPage({ pageTitle = 'Admin Dashboard' }: { pageTitle?: string }) {
  const { isLoggedIn, isLoading: authLoading, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [postsPublic, setPostsPublic] = useState(true);
  const [isUpdatingSiteName, setIsUpdatingSiteName] = useState(false);
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
    fetchStats();
    fetchPosts();
    fetchSiteName();
  }, [isLoggedIn, authLoading, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const headers: HeadersInit = {};
      if (isLoggedIn) {
        headers['Authorization'] = 'Bearer true';
      }
      
      const res = await fetch('/api/posts?_limit=5', { headers });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchSiteName = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSiteName(data.site_name || '');
        setSiteTagline(data.site_tagline || '');
        setPostsPublic(data.posts_public !== false); // Default to true if not set
      } else {
        console.error('Failed to fetch site settings');
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const handleUpdateSiteName = async () => {
    if (!siteName.trim()) {
      setToast({
        message: 'Site name cannot be empty',
        type: 'error'
      });
      return;
    }

    setIsUpdatingSiteName(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          site_name: siteName.trim(),
          site_tagline: siteTagline.trim(),
          posts_public: postsPublic
        }),
      });

      if (res.ok) {
        setToast({
          message: 'Site settings updated successfully!',
          type: 'success'
        });
      } else {
        const errorData = await res.json();
        setToast({
          message: errorData.error || 'Failed to update site settings',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating site name:', error);
      setToast({
        message: 'Failed to update site name',
        type: 'error'
      });
    } finally {
      setIsUpdatingSiteName(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(postId);
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: postId }),
      });

      if (res.ok) {
        setPosts(posts.filter(post => post.id !== postId));
        // Refresh stats to update post count
        fetchStats();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(null);
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
      <DynamicTitle section="Admin Dashboard" />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div style={{ 
        minHeight: '100vh',
        background: 'var(--gradient-primary)',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'var(--gradient-primary)',
            padding: '30px 20px',
            textAlign: 'center',
            color: 'white',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <ThemeToggle />
              <button 
                onClick={logout} 
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </div>
            <h1 style={{ 
              margin: '0', 
              fontSize: '32px',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              color: 'var(--text-white)',
              fontFamily: 'var(--font-primary)'
            }}>Dashboard</h1>
            <p style={{ 
              margin: '10px 0 0 0',
              fontSize: '16px',
              opacity: '0.9'
            }}>Manage your microblog platform</p>
          </div>

          {/* Content */}
          <div style={{ padding: '30px 20px' }}>
      
                  {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px', 
              marginBottom: '40px' 
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '25px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)', 
                textAlign: 'center', 
                color: 'white',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.2)';
              }}>
                <h2 style={{ 
                  color: 'white', 
                  marginBottom: '15px',
                  fontSize: '18px',
                  fontWeight: '600',
                  opacity: '0.9'
                }}>Total Posts</h2>
                <p style={{ 
                  fontSize: '2.5em', 
                  fontWeight: 'bold', 
                  color: 'white',
                  margin: '0 0 15px 0'
                }}>{stats ? stats.postCount : 'Loading...'}</p>
                <Link 
                  href="/" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none', 
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'inline-block',
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
                  Post Something →
                </Link>
              </div>
              <div style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '25px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 16px rgba(240, 147, 251, 0.2)', 
                textAlign: 'center', 
                color: 'white',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(240, 147, 251, 0.2)';
              }}>
                <h2 style={{ 
                  color: 'white', 
                  marginBottom: '15px',
                  fontSize: '18px',
                  fontWeight: '600',
                  opacity: '0.9'
                }}>Total Users</h2>
                <p style={{ 
                  fontSize: '2.5em', 
                  fontWeight: 'bold', 
                  color: 'white',
                  margin: '0'
                }}>{stats ? stats.userCount : 'Loading...'}</p>
              </div>
            </div>

            {/* Site Settings Section */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '30px', 
              borderRadius: '12px', 
              border: '1px solid #e9ecef',
              marginBottom: '40px' 
            }}>
              <h2 style={{ 
                color: '#333', 
                marginBottom: '25px', 
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: '600'
              }}>Site Settings</h2>
              
              {/* Profile Link */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '25px',
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <p style={{ 
                  margin: '0 0 15px 0',
                  fontSize: '16px',
                  color: '#495057'
                }}>Manage your account settings</p>
                <Link href="/admin/profile" style={{ 
                  color: '#007bff', 
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '10px 20px',
                  border: '2px solid #007bff',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#007bff';
                }}>
                  Manage Profile
                </Link>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '20px',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <div style={{ width: '100%' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Enter site name"
                    style={{
                      width: '100%',
                      padding: '15px',
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
                <div style={{ width: '100%' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    placeholder="Enter site tagline"
                    style={{
                      width: '100%',
                      padding: '15px',
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
                <div style={{ width: '100%' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontWeight: '600', 
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Posts Visibility
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      color: '#495057',
                      flex: '1'
                    }}>
                      {postsPublic ? 'Public' : 'Private'}
                    </span>
                    <button
                      onClick={() => setPostsPublic(!postsPublic)}
                      style={{
                        position: 'relative',
                        width: '50px',
                        height: '26px',
                        borderRadius: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: postsPublic ? '#28a745' : '#6c757d',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          transform: postsPublic ? 'translateX(24px)' : 'translateX(0)',
                          transition: 'transform 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: postsPublic ? '#28a745' : '#6c757d',
                        }}
                      >
                        {postsPublic ? '✓' : '✕'}
                      </div>
                    </button>
                  </div>
                  <p style={{
                    margin: '8px 0 0 0',
                    fontSize: '12px',
                    color: '#6c757d',
                    fontStyle: 'italic'
                  }}>
                    {postsPublic 
                      ? 'Posts are visible to all visitors' 
                      : 'Posts are only visible to logged-in admin'
                    }
                  </p>
                </div>
                <button
                  onClick={handleUpdateSiteName}
                  disabled={isUpdatingSiteName}
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isUpdatingSiteName ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    opacity: isUpdatingSiteName ? 0.7 : 1,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpdatingSiteName) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUpdatingSiteName) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                    }
                  }}
                >
                  {isUpdatingSiteName ? 'Updating...' : 'Update Site Settings'}
                </button>
              </div>
            </div>

            {/* Posts Management Section */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '30px', 
              borderRadius: '12px', 
              border: '1px solid #e9ecef'
            }}>
              <h2 style={{ 
                color: '#333', 
                marginBottom: '25px', 
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: '600'
              }}>Latest Posts</h2>
              
              {posts.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#6c757d'
                }}>
                  <p style={{ 
                    fontSize: '18px',
                    margin: '0'
                  }}>No posts found.</p>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gap: '15px'
                }}>
                  {posts.map((post) => (
                    <div key={post.id} style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        gap: '15px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            margin: '0 0 10px 0', 
                            color: '#333', 
                            lineHeight: '1.5',
                            fontSize: '16px'
                          }}>
                            {post.content.length > 150 
                              ? `${post.content.substring(0, 150)}...` 
                              : post.content
                            }
                          </p>
                          <small style={{ 
                            color: '#6c757d', 
                            fontSize: '14px'
                          }}>
                            {new Date(post.timestamp).toLocaleString()} • {getTimeAgo(post.timestamp)}
                          </small>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={isDeleting === post.id}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isDeleting === post.id ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            opacity: isDeleting === post.id ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isDeleting || isDeleting !== post.id) {
                              e.currentTarget.style.backgroundColor = '#c82333';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDeleting || isDeleting !== post.id) {
                              e.currentTarget.style.backgroundColor = '#dc3545';
                              e.currentTarget.style.transform = 'scale(1)';
                            }
                          }}
                        >
                          {isDeleting === post.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}