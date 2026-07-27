import { NextResponse } from 'next/server';
import { execute, queryMany } from '@/lib/db';

export async function GET() {
  try {
    const rules = await queryMany('SELECT * FROM rule_configs');
    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ruleType, scoreWeight, enabled } = body;

    if (!ruleType || typeof scoreWeight !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    await execute(`
      UPDATE rule_configs 
      SET score_weight = ?, enabled = ? 
      WHERE rule_type = ?
    `, [scoreWeight, enabled ? 1 : 0, ruleType]);

    return NextResponse.json({ success: true, ruleType, scoreWeight, enabled });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
