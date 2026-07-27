import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIpHeader = req.headers.get('x-real-ip');
    const detectedIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIpHeader || '127.0.0.1');

    const {
      affiliateId = 'aff_john_doe',
      name = 'John Doe',
      email = 'john_doe@affiliate.com',
      paymentAccount = 'paypal_john_doe@affiliate.com',
      fingerprintHash,
      ip = detectedIp,
    } = body;

    await execute(`
      INSERT INTO affiliate_profiles (affiliate_id, name, email, payment_account, registered_ip, registered_fingerprint_hash)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(affiliate_id) DO UPDATE SET
        registered_ip = excluded.registered_ip,
        registered_fingerprint_hash = excluded.registered_fingerprint_hash,
        email = excluded.email,
        payment_account = excluded.payment_account
    `, [affiliateId, name, email, paymentAccount, ip, fingerprintHash]);

    return NextResponse.json({
      success: true,
      affiliateId,
      registeredIp: ip,
      registeredFingerprintHash: fingerprintHash,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
