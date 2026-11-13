import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'https://parabank.parasoft.com/parabank';

// ParaBank is a JSP app: server-side session via jsessionid cookie, no CSRF token on
// login/register/transfer (verified via curl on index.htm / register.htm on 2026-11-11).
// http.* calls below reuse cookies automatically within a VU because each VU gets its
// own http.CookieJar.
//
// overview.htm and transfer.htm render static shells and fetch account data client-side
// via a REST API (services_proxy/bank/...) that templates the logged-in customer's id
// into an inline <script> block — verified against a real logged-in session on
// 2026-11-12. getOverview()/transfer() below hit that API directly instead of scraping
// server-rendered HTML.

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
  // Note: register.htm consistently returns HTTP 500 ("An internal error has occurred
  // and has been logged") on the official parasoft/parabank Docker image, confirmed
  // 2026-11-12 — the error page gives no further detail. Self-hosted runs log in as a
  // seeded account instead (see DEMO_USERNAME/DEMO_PASSWORD in the scenario scripts);
  // this function is kept for targets where registration does work.
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
  const page = http.get(`${BASE_URL}/overview.htm`);
  const pageOk = check(page, {
    'overview page loaded': (r) => r.body && r.body.includes('Accounts Overview'),
  });
  const customerId = pageOk ? extractCustomerId(page.body) : null;
  if (!customerId) return { res: page, ok: false, accountIds: [] };

  const accounts = http.get(`${BASE_URL}/services_proxy/bank/customers/${customerId}/accounts`);
  const ok = check(accounts, {
    'accounts loaded': (r) => r.status === 200,
  });
  return { res: accounts, ok, accountIds: ok ? extractAccountIds(accounts.body) : [] };
}

export function extractCustomerId(body) {
  const m = body.match(/customers\/"\s*\+\s*(\d+)\s*\+\s*"\/accounts/);
  return m ? m[1] : null;
}

export function extractAccountIds(accountsJsonBody) {
  try {
    return JSON.parse(accountsJsonBody).map((account) => String(account.id));
  } catch {
    return [];
  }
}

export function transfer(fromAccountId, toAccountId, amount) {
  const res = http.post(
    `${BASE_URL}/services_proxy/bank/transfer` +
      `?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}`,
    null
  );
  const ok = check(res, {
    'transfer succeeded': (r) => r.body && r.body.includes('Successfully transferred'),
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
