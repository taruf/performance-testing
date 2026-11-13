import { sleep } from 'k6';
import { login, getOverview, transfer } from '../lib/parabank.js';
import { buildOptions } from '../lib/scenarios.js';

export const options = buildOptions('transferFlow');

const DEMO_USERNAME = __ENV.DEMO_USERNAME || 'john';
const DEMO_PASSWORD = __ENV.DEMO_PASSWORD || 'demo';

export function transferFlow() {
  const { ok: loggedIn } = login(DEMO_USERNAME, DEMO_PASSWORD);
  if (!loggedIn) {
    sleep(2);
    return;
  }
  sleep(1);
  const { ok: overviewOk, accountIds } = getOverview();
  if (overviewOk && accountIds.length > 1) {
    sleep(1);
    transfer(accountIds[0], accountIds[1], 1);
  }
  sleep(Math.random() * 3 + 2); // think time 2-5s
}
