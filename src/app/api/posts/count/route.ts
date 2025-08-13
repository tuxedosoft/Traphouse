import { NextResponse } from 'next/server';
import db from '../../../../lib/database';

export async function GET() {
  try {
    const { count } = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching post count:', error);
    return NextResponse.json({ error: 'Failed to fetch post count' }, { status: 500 });
  }
}