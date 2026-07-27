import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'affiliate_fraud.db');
const dataDir = path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS device_fingerprints (
      id TEXT PRIMARY KEY,
      fingerprint_hash TEXT NOT NULL,
      browser TEXT,
      browser_version TEXT,
      os TEXT,
      timezone TEXT,
      language TEXT,
      screen TEXT,
      canvas_hash TEXT,
      webgl_hash TEXT,
      audio_hash TEXT,
      fonts_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS affiliate_profiles (
      affiliate_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      payment_account TEXT NOT NULL,
      registered_ip TEXT,
      registered_fingerprint_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id TEXT PRIMARY KEY,
      affiliate_id TEXT NOT NULL,
      cookie_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      fingerprint_id TEXT,
      ip TEXT NOT NULL,
      country TEXT DEFAULT 'US',
      is_vpn INTEGER DEFAULT 0,
      is_datacenter INTEGER DEFAULT 0,
      referrer TEXT,
      landing_url TEXT,
      clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fingerprint_id) REFERENCES device_fingerprints(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      payment_account TEXT NOT NULL,
      affiliate_id TEXT NOT NULL,
      amount REAL NOT NULL,
      cookie_id TEXT,
      fingerprint_id TEXT,
      ip TEXT NOT NULL,
      country TEXT DEFAULT 'US',
      external_customer_id TEXT,
      is_vpn INTEGER DEFAULT 0,
      is_datacenter INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS affiliate_risk_scores (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      affiliate_id TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      decision TEXT NOT NULL,
      review_status TEXT DEFAULT 'UNREVIEWED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS affiliate_risk_signals (
      id TEXT PRIMARY KEY,
      risk_score_id TEXT NOT NULL,
      signal_type TEXT NOT NULL,
      score INTEGER NOT NULL,
      reason TEXT NOT NULL,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (risk_score_id) REFERENCES affiliate_risk_scores(id)
    );

    CREATE TABLE IF NOT EXISTS rule_configs (
      id TEXT PRIMARY KEY,
      rule_type TEXT UNIQUE NOT NULL,
      score_weight INTEGER NOT NULL,
      enabled INTEGER DEFAULT 1,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS blacklisted_attributes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- 'IP' | 'DOMAIN' | 'EMAIL'
      value TEXT UNIQUE NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate columns for existing orders table if needed
  try {
    const tableInfo = db.prepare("PRAGMA table_info('orders')").all() as any[];
    const hasCountry = tableInfo.some((col) => col.name === 'country');
    const hasExternalCustomerId = tableInfo.some((col) => col.name === 'external_customer_id');

    if (!hasCountry) {
      db.exec("ALTER TABLE orders ADD COLUMN country TEXT DEFAULT 'US'");
    }
    if (!hasExternalCustomerId) {
      db.exec("ALTER TABLE orders ADD COLUMN external_customer_id TEXT");
    }
  } catch (err) {
    console.error('Migration error:', err);
  }

  // Insert default affiliate profile for aff_john_doe if not exists
  const affProfile = db.prepare('SELECT affiliate_id FROM affiliate_profiles WHERE affiliate_id = ?').get('aff_john_doe');
  if (!affProfile) {
    db.prepare(`
      INSERT INTO affiliate_profiles (affiliate_id, name, email, payment_account, registered_ip, registered_fingerprint_hash)
      VALUES ('aff_john_doe', 'John Doe (Affiliate)', 'john_doe@affiliate.com', 'paypal_john_doe@affiliate.com', '118.69.182.10', 'fp_john_macbook_m2')
    `).run();
  }

  // Insert default blacklisted values for demo
  const blacklistCount = db.prepare('SELECT COUNT(*) as count FROM blacklisted_attributes').get() as { count: number };
  if (blacklistCount.count === 0) {
    db.prepare(`INSERT INTO blacklisted_attributes (id, type, value, reason) VALUES ('bl_1', 'IP', '198.51.100.99', 'Known Click Farm Node')`).run();
    db.prepare(`INSERT INTO blacklisted_attributes (id, type, value, reason) VALUES ('bl_2', 'DOMAIN', 'spam-ad-network.biz', 'Referral Spam Network')`).run();
  }

  // Ensure default rules cover 100% Tapfiliate feature set
  const defaultRules = [
    { type: 'SELF_REFERRAL', weight: 100, desc: 'Affiliate email matches buyer email or account' },
    { type: 'SAME_PAYMENT_ACCOUNT', weight: 100, desc: 'Buyer uses affiliate payment account' },
    { type: 'SAME_COOKIE', weight: 100, desc: 'Buyer cookie matches affiliate creation session' },
    { type: 'SAME_FINGERPRINT', weight: 70, desc: 'Buyer device fingerprint matches affiliate device' },
    { type: 'SAME_IP', weight: 35, desc: 'Buyer IP address matches affiliate click IP' },
    { type: 'DISPOSABLE_EMAIL', weight: 30, desc: 'Buyer uses disposable or temporary email domain' },
    { type: 'VPN_USAGE', weight: 20, desc: 'Buyer or click IP detected as commercial VPN' },
    { type: 'PROXY_USAGE', weight: 20, desc: 'Buyer or click IP detected as proxy' },
    { type: 'DATACENTER_IP', weight: 20, desc: 'Traffic originates from a datacenter hosting provider' },
    { type: 'VELOCITY_EXCEEDED', weight: 20, desc: 'High frequency of purchases or clicks in short timeframe' },
    { type: 'IP_BLACKLISTED', weight: 100, desc: 'IP address is explicitly blacklisted in security database' },
    { type: 'REFERRER_SPAM_OR_CLOAKED', weight: 30, desc: 'Referrer URL is blacklisted, cloaked, or suspicious' },
    { type: 'SUSPICIOUS_GEOLOCATION', weight: 30, desc: 'Traffic originates from high-risk or non-target country' },
    { type: 'CLICK_INFLATION_NO_CONVERSION', weight: 30, desc: 'High click volume from affiliate with abnormally low conversion rate' },
    { type: 'DUPLICATE_CONVERSION', weight: 100, desc: 'Duplicate customer ID or transaction ID claiming multiple commissions' },
  ];

  const insertRule = db.prepare(`
    INSERT OR IGNORE INTO rule_configs (id, rule_type, score_weight, enabled, description)
    VALUES (?, ?, ?, 1, ?)
  `);

  for (const r of defaultRules) {
    insertRule.run(`rule_${r.type.toLowerCase()}`, r.type, r.weight, r.desc);
  }
}

// Auto init on load
initDatabase();
