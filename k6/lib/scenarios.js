// Shared scenario/threshold presets, selected via the TEST_TYPE env var.
// Usage in a script: `export const options = buildOptions('loginFlow');`
//   k6 run -e TEST_TYPE=load k6/scenarios/login.js
//   k6 run -e TEST_TYPE=stress k6/scenarios/login.js
//   k6 run -e TEST_TYPE=spike k6/scenarios/login.js
//   k6 run -e TEST_TYPE=soak k6/scenarios/login.js

export function buildOptions(execName) {
  const type = __ENV.TEST_TYPE || 'load';

  const presets = {
    // Normal expected peak-hour traffic, sustained.
    load: {
      scenarios: {
        [execName]: {
          executor: 'ramping-vus',
          exec: execName,
          startVUs: 0,
          stages: [
            { duration: '1m', target: 10 },
            { duration: '5m', target: 10 },
            { duration: '1m', target: 0 },
          ],
        },
      },
      thresholds: {
        http_req_duration: ['p(95)<800', 'p(99)<1500'],
        http_req_failed: ['rate<0.01'],
      },
    },
    // Push well beyond expected peak until error rate/latency blows up.
    stress: {
      scenarios: {
        [execName]: {
          executor: 'ramping-vus',
          exec: execName,
          startVUs: 0,
          stages: [
            { duration: '2m', target: 20 },
            { duration: '2m', target: 40 },
            { duration: '2m', target: 80 },
            { duration: '2m', target: 120 },
            { duration: '2m', target: 0 },
          ],
        },
      },
      // Thresholds here are observational, not pass/fail gates — we expect to find
      // the breaking point, not avoid it.
      thresholds: {
        http_req_duration: ['p(95)<5000'],
      },
    },
    // Sudden burst, then back to idle — check recovery.
    spike: {
      scenarios: {
        [execName]: {
          executor: 'ramping-vus',
          exec: execName,
          startVUs: 0,
          stages: [
            { duration: '30s', target: 5 },
            { duration: '20s', target: 100 },
            { duration: '1m', target: 100 },
            { duration: '20s', target: 5 },
            { duration: '1m', target: 5 },
          ],
        },
      },
      thresholds: {
        http_req_duration: ['p(95)<5000'],
      },
    },
    // Moderate constant load for a long duration — leaks/degradation over time.
    soak: {
      scenarios: {
        [execName]: {
          executor: 'constant-vus',
          exec: execName,
          vus: Number(__ENV.SOAK_VUS || 10),
          duration: __ENV.SOAK_DURATION || '1h',
        },
      },
      thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.01'],
      },
    },
  };

  const preset = presets[type];
  if (!preset) {
    throw new Error(`Unknown TEST_TYPE "${type}". Use load|stress|spike|soak.`);
  }
  return preset;
}
