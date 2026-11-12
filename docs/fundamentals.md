# Performance testing fundamentals

## Test types
- **Load test** — expected/normal traffic, sustained, to see typical latency & throughput.
- **Stress test** — push beyond expected peak until something breaks, to find the ceiling.
- **Spike test** — sudden jump in traffic (e.g. 10x for 1 minute) to see recovery behaviour.
- **Soak test** — sustained moderate load for a long duration (hours+) to catch memory
  leaks, connection exhaustion, log/disk growth.

## Workload modelling
- **Arrival rate vs virtual users (VUs)**: VUs simulate concurrent users looping through a
  script with think time — the resulting request rate depends on think time and response
  time. Arrival rate (open model) directly specifies requests/sec regardless of how long
  each takes to respond — closer to how real traffic arrives. k6's `ramping-arrival-rate`
  / `constant-arrival-rate` executors model this; `ramping-vus` models the closed/VU model.
- **Think time**: pause between a user's requests, modelled to avoid unrealistic
  back-to-back hammering. Typically randomised (e.g. 1–5s) rather than fixed.
- **Little's Law**: `L = λ × W`
  - L = average number of concurrent users (VUs) in the system
  - λ = arrival rate (requests/sec)
  - W = average time each request spends in the system (response time)
  - Useful to sanity check: if I want λ = 50 req/s and W = 0.5s, I need ~25 concurrent VUs.

## Metrics that matter
- **p95 / p99 latency** — 95th/99th percentile response time; average hides tail latency
  that real users actually feel.
- **Throughput** — requests/sec (or transactions/sec) the system sustains.
- **Error rate** — % of requests failing (non-2xx, timeouts, failed checks).

## Open questions / things to verify
- [ ] Confirm ParaBank's actual login/overview/transfer request/response shapes (HAR capture).
- [ ] Decide peak-hour assumption for the one-page workload model.
