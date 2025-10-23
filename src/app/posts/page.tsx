"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DynamicTitle from '../../components/DynamicTitle';
import ThemeToggle from '../../components/ThemeToggle';
import PostContent from '../../components/PostContent';

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

const POSTS_PER_PAGE = 10;


export default function PostsPage({ pageTitle = 'All Posts' }: { pageTitle?: string }) {
  const { isLoggedIn } = useAuth();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [postsPublic, setPostsPublic] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchTotalPosts();
    fetchPrivacySetting();
  }, [currentPage, isLoggedIn]);

  const fetchPrivacySetting = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setPostsPublic(data.posts_public !== false); // Default to true if not set
      }
    } catch (error) {
      console.error('Error fetching privacy setting:', error);
    }
  };

  const fetchPosts = async () => {
    const headers: HeadersInit = {};
    if (isLoggedIn) {
      headers['Authorization'] = 'Bearer true';
    }
    
    const res = await fetch(`/api/posts?_limit=${POSTS_PER_PAGE}&_page=${currentPage}`, { headers });
    const data = await res.json();
    setPosts(data);
  };

  const fetchTotalPosts = async () => {
    const res = await fetch('/api/posts/count');
    const data = await res.json();
    setTotalPosts(data.count);
  };

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

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
        // Remove the deleted post from the list
        setPosts(posts.filter(post => post.id !== postId));
        // Update total count
        setTotalPosts(prev => prev - 1);
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

  return (
    <>
      <DynamicTitle section="All Posts" />
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
              right: '20px'
            }}>
              <ThemeToggle />
            </div>
            <h1 style={{ 
              margin: '0', 
              fontSize: '32px',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              color: 'var(--text-white)'
            }}>All Posts</h1>
            <p style={{ 
              margin: '10px 0 0 0',
              fontSize: '16px',
              opacity: '0.9'
            }}>Browse all my posts</p>
          </div>

          {/* Content */}
          <div style={{ padding: '30px 20px' }}>
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
                    margin: '0'
                  }}>No posts yet.</p>
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
                    <PostContent content={post.content} />
                    <small style={{ 
                      color: 'var(--text-muted)', 
                      fontSize: '14px', 
                      display: 'block', 
                      textAlign: 'right'
                    }}>
                      {new Date(post.timestamp).toLocaleString()} • {getTimeAgo(post.timestamp)}
                    </small>
                    
                    {/* Delete Button - Only show when admin is logged in */}
                    {isLoggedIn && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={isDeleting === post.id}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: 'var(--button-danger)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: isDeleting === post.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          opacity: isDeleting === post.id ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isDeleting || isDeleting !== post.id) {
                            e.currentTarget.style.backgroundColor = 'var(--button-danger-hover)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDeleting || isDeleting !== post.id) {
                            e.currentTarget.style.backgroundColor = 'var(--button-danger)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {isDeleting === post.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '30px',
                padding: '20px 0'
              }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '10px 16px',
                      margin: '0 4px',
                      backgroundColor: currentPage === page ? 'var(--button-primary)' : 'var(--bg-secondary)',
                      color: currentPage === page ? 'white' : 'var(--text-primary)',
                      border: currentPage === page ? 'none' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === page ? '600' : '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = 'var(--border-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}

            {/* Back to Home Link */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              padding: '20px'
            }}>
              <Link href="/" style={{ 
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
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}