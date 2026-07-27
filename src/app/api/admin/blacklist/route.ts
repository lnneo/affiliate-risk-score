import { NextResponse } from 'next/server';
import { execute, queryMany } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const list = await queryMany('SELECT * FROM blacklisted_attributes ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, value, reason } = body;

    if (!type || !value) {
      return NextResponse.json({ success: false, error: 'Type and value are required' }, { status: 400 });
    }

    const id = `bl_${randomUUID()}`;
    await execute(`
      INSERT INTO blacklisted_attributes (id, type, value, reason)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(value) DO UPDATE SET reason = excluded.reason
    `, [id, type, value, reason || 'Blacklisted by Admin']);

    return NextResponse.json({ success: true, message: 'Successfully added to blacklist' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID parameter' }, { status: 400 });
    }

    await execute('DELETE FROM blacklisted_attributes WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Successfully deleted from blacklist' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
