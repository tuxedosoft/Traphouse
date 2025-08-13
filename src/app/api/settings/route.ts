import { NextResponse } from 'next/server';
import db from '../../../lib/database';

export async function GET() {
  try {
    const siteNameSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_name');
    const siteTaglineSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_tagline');
    const privacySetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('posts_public');
    
    return NextResponse.json({ 
      site_name: siteNameSetting ? siteNameSetting.value : 'Microblog',
      site_tagline: siteTaglineSetting ? siteTaglineSetting.value : 'Share your thoughts with the world',
      posts_public: privacySetting ? privacySetting.value === 'true' : true
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { site_name, site_tagline, posts_public } = await request.json();
    
    // Validate site name
    if (typeof site_name !== 'string' || site_name.trim() === '') {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    // Validate tagline (optional but if provided, must be string)
    if (site_tagline !== undefined && (typeof site_tagline !== 'string' || site_tagline.trim() === '')) {
      return NextResponse.json({ error: 'Site tagline cannot be empty' }, { status: 400 });
    }

    // Validate posts_public (optional but if provided, must be boolean)
    if (posts_public !== undefined && typeof posts_public !== 'boolean') {
      return NextResponse.json({ error: 'Posts public setting must be a boolean' }, { status: 400 });
    }

    // Update site name
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('site_name', site_name);
    
    // Update tagline if provided
    if (site_tagline !== undefined) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('site_tagline', site_tagline);
    }

    // Update privacy setting if provided
    if (posts_public !== undefined) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('posts_public', posts_public.toString());
    }
    
    return NextResponse.json({ message: 'Site settings updated successfully' });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}