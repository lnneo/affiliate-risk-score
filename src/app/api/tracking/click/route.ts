import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Get Real Client IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIpHeader = req.headers.get('x-real-ip');
    const detectedIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIpHeader || '127.0.0.1');

    const {
      affiliateId = 'aff_john_doe',
      cookieId = `ck_${randomUUID()}`,
      sessionId = `sess_${randomUUID()}`,
      fingerprintHash,
      fingerprintDetails = {},
      ip = detectedIp,
      isVpn = false,
      isDatacenter = false,
      referrer = req.headers.get('referer') || 'https://google.com',
      landingUrl = req.url,
    } = body;

    let fingerprintDbId: string | null = null;

    if (fingerprintHash) {
      // Find or create device fingerprint
      const existingFp = await queryOne<{ id: string }>(
        'SELECT id FROM device_fingerprints WHERE fingerprint_hash = ?',
        [fingerprintHash],
      );
      if (existingFp) {
        fingerprintDbId = existingFp.id;
      } else {
        fingerprintDbId = `fp_${randomUUID()}`;
        await execute(`
          INSERT INTO device_fingerprints (id, fingerprint_hash, browser, browser_version, os, timezone, language, screen, canvas_hash, webgl_hash, audio_hash, fonts_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          fingerprintDbId,
          fingerprintHash,
          fingerprintDetails.browser || 'Browser',
          fingerprintDetails.browserVersion || '1.0',
          fingerprintDetails.os || 'OS',
          fingerprintDetails.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          fingerprintDetails.language || 'en-US',
          fingerprintDetails.screen || '1920x1080',
          fingerprintDetails.canvasHash || 'cv_default',
          fingerprintDetails.webglHash || 'gl_default',
          fingerprintDetails.audioHash || 'au_default',
          fingerprintDetails.fontsHash || 'ft_default',
        ]);
      }
    }

    const clickId = `clk_${randomUUID()}`;
    await execute(`
      INSERT INTO affiliate_clicks (id, affiliate_id, cookie_id, session_id, fingerprint_id, ip, is_vpn, is_datacenter, referrer, landing_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clickId,
      affiliateId,
      cookieId,
      sessionId,
      fingerprintDbId,
      ip,
      isVpn ? 1 : 0,
      isDatacenter ? 1 : 0,
      referrer,
      landingUrl,
    ]);

    return NextResponse.json({
      success: true,
      clickId,
      cookieId,
      sessionId,
      fingerprintDbId,
      affiliateId,
      clientIp: ip,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
