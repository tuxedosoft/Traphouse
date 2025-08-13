"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DynamicTitle from '../components/DynamicTitle';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';

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

export default function Home({ pageTitle = 'Home' }: { pageTitle?: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const { isLoggedIn, logout } = useAuth();
  const { theme } = useTheme();
  const [siteName, setSiteName] = useState('Traphouse');
  const [siteTagline, setSiteTagline] = useState('Share your thoughts with the world');
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPublic, setPostsPublic] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchTotalPosts();
    fetchSiteName();
  }, [isLoggedIn]);

  const fetchSiteName = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSiteName(data.site_name || 'Traphouse');
        setSiteTagline(data.site_tagline || 'Share your thoughts with the world');
        setPostsPublic(data.posts_public !== false); // Default to true if not set
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const fetchPosts = async () => {
    const headers: HeadersInit = {};
    if (isLoggedIn) {
      headers['Authorization'] = 'Bearer true';
    }
    
    const res = await fetch('/api/posts?_limit=10', { headers });
    const data = await res.json();
    setPosts(data);
  };

  const fetchTotalPosts = async () => {
    const res = await fetch('/api/posts/count');
    const data = await res.json();
    setTotalPosts(data.count);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newPostContent }),
    });

    if (res.ok) {
      setNewPostContent('');
      fetchPosts();
    } else {
      alert('Failed to create post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchPosts();
        fetchTotalPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post.');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const currentLength = newPostContent.length;
    const newLength = currentLength + pastedText.length;
    
    if (newLength > 1500) {
      e.preventDefault();
      setToast({
        message: `The text has exceeded the 1500 character limit. (${newLength} characters)`,
        type: 'warning'
      });
    }
  };

    return (
    <>
      <DynamicTitle />
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
          maxWidth: '600px', 
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
              {isLoggedIn && (
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
              )}
            </div>
            <h1 style={{ 
              margin: '0', 
              fontSize: '32px',
              fontWeight: '600',
              color: 'var(--text-white)',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>{siteName}</h1>
            <p style={{ 
              margin: '10px 0 0 0',
              fontSize: '16px',
              opacity: '0.9'
            }}>{siteTagline}</p>
          </div>



          {/* Content */}
          <div style={{ padding: '30px 20px' }}>
            {isLoggedIn ? (
              <form onSubmit={handleSubmit} style={{ 
                marginBottom: '30px', 
                padding: '25px', 
                background: 'var(--bg-secondary)',
                borderRadius: '12px', 
                border: '1px solid var(--border-color)'
              }}>
                <textarea
                  value={newPostContent}
                  onChange={(e) => {
                    if (e.target.value.length <= 1500) {
                      setNewPostContent(e.target.value);
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder="What's on your mind?"
                  style={{ 
                    width: '100%', 
                    minHeight: '100px', 
                    padding: '15px', 
                    border: '2px solid var(--input-border)', 
                    borderRadius: '8px', 
                    resize: 'vertical', 
                    marginBottom: '10px',
                    fontSize: '16px',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {newPostContent.length}/1500 characters
                  </span>
                </div>
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
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
                  Post
                </button>
              </form>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '30px', 
                padding: '30px', 
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <p style={{ 
                  margin: '0 0 15px 0',
                  fontSize: '16px',
                  color: 'var(--text-primary)'
                }}>Please <Link href="/login" style={{ 
                  color: 'var(--button-primary)', 
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>Sign In</Link> to create a post.</p>
              </div>
            )}

            {/* Posts Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
              {!postsPublic && !isLoggedIn ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: 'var(--text-muted)'
                }}>
                  <p style={{ 
                    fontSize: '18px',
                    margin: '0 0 10px 0'
                  }}>Posts are currently private.</p>
                  <p style={{ 
                    fontSize: '14px',
                    margin: '0'
                  }}>Please <Link href="/login" style={{ 
                    color: 'var(--button-primary)', 
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}>Sign In</Link> to view posts.</p>
                </div>
              ) : posts.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: 'var(--text-muted)'
                }}>
                  <p style={{ 
                    fontSize: '18px',
                    margin: '0 0 10px 0'
                  }}>No posts yet.</p>
                  <p style={{ 
                    fontSize: '14px',
                    margin: '0'
                  }}>Be the first to share your thoughts!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} style={{
                    position: 'relative',
                    background: 'var(--bg-card)',
                    padding: '20px',
                    marginBottom: '20px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border-color)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow)';
                  }}>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      color: 'var(--text-primary)', 
                      lineHeight: '1.6',
                      fontSize: '16px'
                    }}>{post.content}</p>
                    <small style={{ 
                      color: 'var(--text-muted)', 
                      fontSize: '14px', 
                      display: 'block', 
                      textAlign: 'right'
                    }}>
                      {new Date(post.timestamp).toLocaleString()} • {getTimeAgo(post.timestamp)}
                    </small>
                    {isLoggedIn && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: 'var(--button-danger)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--button-danger-hover)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--button-danger)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              )}
              {totalPosts > 10 && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '30px',
                  padding: '20px'
                }}>
                  <Link href="/posts" style={{ 
                    color: 'var(--button-primary)', 
                    textDecoration: 'none', 
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '12px 24px',
                    border: '2px solid var(--button-primary)',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--button-primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--button-primary)';
                  }}>
                    View All Posts
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}