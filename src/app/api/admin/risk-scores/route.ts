import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const decisionFilter = searchParams.get('decision');
    const affiliateFilter = searchParams.get('affiliateId');

    let query = `
      SELECT 
        rs.id as risk_score_id,
        rs.order_id,
        rs.user_id,
        rs.affiliate_id,
        rs.total_score,
        rs.decision,
        rs.review_status,
        rs.created_at,
        o.user_email,
        o.payment_account,
        o.amount,
        o.ip,
        o.is_vpn,
        o.is_datacenter,
        o.cookie_id,
        o.fingerprint_id,
        df.fingerprint_hash
      FROM affiliate_risk_scores rs
      JOIN orders o ON rs.order_id = o.id
      LEFT JOIN device_fingerprints df ON o.fingerprint_id = df.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (decisionFilter && decisionFilter !== 'ALL') {
      query += ` AND rs.decision = ?`;
      params.push(decisionFilter);
    }

    if (affiliateFilter) {
      query += ` AND rs.affiliate_id = ?`;
      params.push(affiliateFilter);
    }

    query += ` ORDER BY rs.created_at DESC LIMIT 100`;

    const riskScores = db.prepare(query).all(...params) as any[];

    // Attach signals to each score
    const getSignals = db.prepare(`
      SELECT signal_type, score, reason, metadata_json, created_at 
      FROM affiliate_risk_signals 
      WHERE risk_score_id = ?
    `);

    const result = riskScores.map((score) => {
      const rawSignals = getSignals.all(score.risk_score_id) as any[];
      return {
        ...score,
        signals: rawSignals.map((s) => ({
          ...s,
          metadata: s.metadata_json ? JSON.parse(s.metadata_json) : null,
        })),
      };
    });

    return NextResponse.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { riskScoreId, reviewStatus } = body; // reviewStatus: 'APPROVED' | 'REJECTED'

    if (!riskScoreId || !['APPROVED', 'REJECTED'].includes(reviewStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    db.prepare(`
      UPDATE affiliate_risk_scores 
      SET review_status = ? 
      WHERE id = ?
    `).run(reviewStatus, riskScoreId);

    return NextResponse.json({ success: true, riskScoreId, reviewStatus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
