import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'https://parabank.parasoft.com/parabank';

// ParaBank is an old JSP app: pure HTML forms, server-side session via jsessionid cookie,
// no CSRF token observed on login/register/transfer forms (verified via curl on
// index.htm / register.htm on 2026-11-11). http.* calls below reuse cookies automatically
// within a VU because each VU gets its own http.CookieJar.

export function login(username, password) {
  const res = http.post(`${BASE_URL}/login.htm`, {
    username: username,
    password: password,
  });
  const ok = check(res, {
    'login succeeded': (r) => r.body && r.body.includes('Accounts Overview'),
  });
  return { res, ok };
}

export function registerUser(user) {
  // user: { firstName, lastName, street, city, state, zipCode, phone, ssn, username, password }
  const res = http.post(`${BASE_URL}/register.htm`, {
    'customer.firstName': user.firstName,
    'customer.lastName': user.lastName,
    'customer.address.street': user.street,
    'customer.address.city': user.city,
    'customer.address.state': user.state,
    'customer.address.zipCode': user.zipCode,
    'customer.phoneNumber': user.phone,
    'customer.ssn': user.ssn,
    'customer.username': user.username,
    'customer.password': user.password,
    repeatedPassword: user.password,
  });
  check(res, {
    'registration succeeded': (r) => r.body && r.body.includes('Accounts Overview'),
  });
  return res;
}

export function getOverview() {
  const res = http.get(`${BASE_URL}/overview.htm`);
  // TODO: confirm the account table id/row markup against a real logged-in session —
  // not verified yet (needs a browser session to inspect, see docs/fundamentals.md).
  const ok = check(res, {
    'overview loaded': (r) => r.body && r.body.includes('Accounts Overview'),
    'has account table': (r) => r.body && r.body.includes('accountTable'),
  });
  const accountIds = ok ? extractAccountIds(res.body) : [];
  return { res, ok, accountIds };
}

export function extractAccountIds(body) {
  const ids = new Set();
  const re = /activity\.htm\?id=(\d+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    ids.add(m[1]);
  }
  return Array.from(ids);
}

export function transfer(fromAccountId, toAccountId, amount) {
  const res = http.post(`${BASE_URL}/transfer.htm`, {
    fromAccountId: String(fromAccountId),
    toAccountId: String(toAccountId),
    amount: String(amount),
  });
  const ok = check(res, {
    'transfer succeeded': (r) => r.body && r.body.includes('Transfer Complete'),
  });
  return { res, ok };
}

export function randomUser(seed) {
  const ts = `${Date.now()}${seed}`;
  return {
    firstName: 'K6',
    lastName: 'Tester',
    street: '1 Test St',
    city: 'Testville',
    state: 'CA',
    zipCode: '90210',
    phone: '5551234567',
    ssn: `${ts}`.slice(-9),
    username: `k6user_${ts}`,
    password: 'Passw0rd!',
  };
}
