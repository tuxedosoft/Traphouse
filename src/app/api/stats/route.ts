import { NextResponse } from 'next/server';
import db from '../../../lib/database';

export async function GET() {
  try {
    const postCount = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

    return NextResponse.json({ postCount, userCount });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}