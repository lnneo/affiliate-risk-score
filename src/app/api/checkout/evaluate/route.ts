import { NextResponse } from 'next/server';
import { evaluateOrderRisk } from '@/lib/fraud/risk-engine';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Get Real Client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIpHeader = req.headers.get('x-real-ip');
    const detectedIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIpHeader || '127.0.0.1');

    const orderId = body.orderId || `ord_${randomUUID()}`;
    const userId = body.userId || `usr_${randomUUID().slice(0, 8)}`;

    const orderContext = {
      orderId,
      userId,
      userEmail: body.userEmail || 'buyer@example.com',
      paymentAccount: body.paymentAccount || 'paypal_buyer@example.com',
      affiliateId: body.affiliateId || 'aff_john_doe',
      amount: Number(body.amount) || 99.00,
      cookieId: body.cookieId,
      fingerprintHash: body.fingerprintHash,
      ip: body.ip || detectedIp,
      isVpn: Boolean(body.isVpn),
      isDatacenter: Boolean(body.isDatacenter),
      createdAt: new Date().toISOString(),
    };

    const evaluationResult = await evaluateOrderRisk(orderContext);

    return NextResponse.json({
      success: true,
      order: orderContext,
      evaluation: evaluationResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
