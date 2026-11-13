import { sleep } from 'k6';
import { login, getOverview } from '../lib/parabank.js';
import { buildOptions } from '../lib/scenarios.js';

export const options = buildOptions('overviewFlow');

const DEMO_USERNAME = __ENV.DEMO_USERNAME || 'john';
const DEMO_PASSWORD = __ENV.DEMO_PASSWORD || 'demo';

export function overviewFlow() {
  const { ok } = login(DEMO_USERNAME, DEMO_PASSWORD);
  if (ok) {
    sleep(1); // brief pause between login and viewing overview
    getOverview();
  }
  sleep(Math.random() * 3 + 2); // think time 2-5s
}
