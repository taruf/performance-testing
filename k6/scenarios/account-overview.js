import { sleep } from 'k6';
import { login, getOverview, registerUser, randomUser } from '../lib/parabank.js';
import { buildOptions } from '../lib/scenarios.js';

export const options = buildOptions('overviewFlow');

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

export function overviewFlow(data) {
  const user = data.users[__VU % data.users.length];
  const { ok } = login(user.username, user.password);
  if (ok) {
    sleep(1); // brief pause between login and viewing overview
    getOverview();
  }
  sleep(Math.random() * 3 + 2); // think time 2-5s
}
