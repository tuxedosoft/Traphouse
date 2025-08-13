import { NextResponse } from 'next/server';
import db from '../../../lib/database';

export async function GET(request: Request) {
  try {
    // Check if posts are public
    const privacySetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('posts_public');
    const postsPublic = privacySetting ? privacySetting.value === 'true' : true;

    // Check if user is authenticated (admin)
    const authHeader = request.headers.get('authorization');
    const isAdmin = authHeader === 'Bearer true'; // Simple check for admin token

    // If posts are private and user is not admin, return empty array
    if (!postsPublic && !isAdmin) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('_limit');
    const page = searchParams.get('_page');

    let query = 'SELECT * FROM posts ORDER BY timestamp DESC';
    let params: (string | number)[] = [];

    if (limit && page) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ' LIMIT ? OFFSET ?';
      params = [parseInt(limit), offset];
    } else if (limit) {
      query += ' LIMIT ?';
      params = [parseInt(limit)];
    }

    const posts = db.prepare(query).all(...params);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    db.prepare('INSERT INTO posts (id, content, timestamp) VALUES (?, ?, ?)').run(id, content, timestamp);

    const newPost = { id, content, timestamp };
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}