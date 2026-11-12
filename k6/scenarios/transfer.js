import { sleep } from 'k6';
import { login, getOverview, transfer, registerUser, randomUser } from '../lib/parabank.js';
import { buildOptions } from '../lib/scenarios.js';

export const options = buildOptions('transferFlow');

// Each registered ParaBank user is created with a single checking account by default,
// so a same-user transfer needs a second account. Opening one via the bank's
// "open new account" flow is a separate endpoint — kept out of scope for now.
// For this script we transfer a small amount from the user's account to itself,
// which is enough to exercise the transfer.htm endpoint and its validation/DB write
// path under load. Swap in two distinct account IDs once you've captured them from a
// real logged-in session (see docs/fundamentals.md TODOs).
export function setup() {
  const count = Number(__ENV.USER_COUNT || 20);
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = randomUser(i);
    registerUser(user);
    users.push({ username: user.username, password: user.password });
  }
  return { users };
}

export function transferFlow(data) {
  const user = data.users[__VU % data.users.length];
  const { ok: loggedIn } = login(user.username, user.password);
  if (!loggedIn) {
    sleep(2);
    return;
  }
  sleep(1);
  const { ok: overviewOk, accountIds } = getOverview();
  if (overviewOk && accountIds.length > 0) {
    const accountId = accountIds[0];
    sleep(1);
    transfer(accountId, accountId, 10);
  }
  sleep(Math.random() * 3 + 2); // think time 2-5s
}
