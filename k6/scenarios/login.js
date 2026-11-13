import { sleep } from 'k6';
import { login } from '../lib/parabank.js';
import { buildOptions } from '../lib/scenarios.js';

export const options = buildOptions('loginFlow');

// Self-hosted ParaBank's register.htm is broken (see lib/parabank.js), so every VU logs
// in as the same seeded account rather than a distinct registered user.
const DEMO_USERNAME = __ENV.DEMO_USERNAME || 'john';
const DEMO_PASSWORD = __ENV.DEMO_PASSWORD || 'demo';

export function loginFlow() {
  login(DEMO_USERNAME, DEMO_PASSWORD);
  sleep(Math.random() * 3 + 2); // think time 2-5s
}
