import { NextResponse } from 'next/server';
import db from '../../../../lib/database';
import bcrypt from 'bcrypt';

export async function PUT(request: Request) {
  try {
    const { currentUsername, newUsername, currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!currentUsername || !currentPassword) {
      return NextResponse.json({ error: 'Current username and password are required' }, { status: 400 });
    }

    // Get current user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(currentUsername);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Check if new username is already taken (if changing username)
    if (newUsername && newUsername !== currentUsername) {
      const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(newUsername);
      if (existingUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
    }

    // Update username if provided
    if (newUsername && newUsername !== currentUsername) {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(newUsername, user.id);
    }

    // Update password if provided
    if (newPassword) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      username: newUsername || currentUsername
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 