import { sleep } from 'k6';
import { login, registerUser, randomUser } from '../lib/parabank.js';
import { buildOptions } from '../lib/scenarios.js';

export const options = buildOptions('loginFlow');

// One registered user per VU, created once in setup() so the load phase measures
// login performance, not registration performance.
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

export function loginFlow(data) {
  const user = data.users[__VU % data.users.length];
  login(user.username, user.password);
  sleep(Math.random() * 3 + 2); // think time 2-5s
}
