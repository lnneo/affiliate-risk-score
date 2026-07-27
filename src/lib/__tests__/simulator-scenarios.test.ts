import { afterEach, describe, expect, it } from 'vitest';

import { execute, initDatabase } from '../db';
import { evaluateOrderRisk } from '../fraud/risk-engine';
import { SIMULATOR_SCENARIOS, toOrderContext } from '../simulator-scenarios';

async function clearOrderHistory() {
  await execute('DELETE FROM affiliate_risk_signals');
  await execute('DELETE FROM affiliate_risk_scores');
  await execute('DELETE FROM orders');
}

describe('simulator scenarios', () => {
  afterEach(async () => {
    await clearOrderHistory();
  });

  it('evaluates each preset to its target decision', async () => {
    await initDatabase();

    for (const scenario of SIMULATOR_SCENARIOS) {
      if (scenario.id === 'reject_duplicate_conversion') {
        continue;
      }

      await clearOrderHistory();

      const result = await evaluateOrderRisk(
        toOrderContext(scenario.form, { orderId: `ord_test_${scenario.id}` }),
      );

      expect(result.decision, scenario.id).toBe(scenario.decision);
    }
  });

  it('evaluates duplicate conversion after demo seed customer exists', async () => {
    await initDatabase();
    await clearOrderHistory();

    await evaluateOrderRisk(
      toOrderContext(
        {
          affiliateId: 'aff_john_doe',
          userId: 'usr_alice_smith',
          userEmail: 'alice.smith@gmail.com',
          paymentAccount: 'card_visa_9841',
          ip: '10.20.0.9',
          cookieId: 'ck_seed_alice',
          fingerprintHash: 'fp_buyer_alice_macbook',
          country: 'US',
          referrer: 'https://google.com',
          externalCustomerId: 'cust_alice_101',
          isVpn: false,
          isDatacenter: false,
          amount: 149,
        },
        { orderId: 'ord_seed_duplicate' },
      ),
    );

    const duplicateScenario = SIMULATOR_SCENARIOS.find((scenario) => scenario.id === 'reject_duplicate_conversion');
    expect(duplicateScenario).toBeDefined();

    const result = await evaluateOrderRisk(
      toOrderContext(duplicateScenario!.form, { orderId: 'ord_test_duplicate' }),
    );

    expect(result.decision).toBe('REJECT');
    expect(result.signals.some((signal) => signal.type === 'DUPLICATE_CONVERSION')).toBe(true);
  });
});
