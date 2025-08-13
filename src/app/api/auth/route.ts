import { NextResponse } from 'next/server';
import db from '../../../lib/database';

import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user && bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}