# Workload Model — ParaBank (one page)

> Keep this to one page — it's a reference for sizing the k6/JMeter scenarios and for the
> final report.

## Assumptions
- **Registered users (population):** TBD (e.g. 10,000)
- **Daily active users:** TBD (e.g. 10% of population = 1,000)
- **Peak hour share of daily traffic:** TBD (e.g. 20% of daily traffic in the busiest hour)
- **Peak hour active users:** `daily active users × peak hour share`
- **Average session length:** TBD (e.g. 4 minutes)
- **Think time between actions:** 2–5s (randomised)

## Concurrency via Little's Law
`Concurrent users (L) = Peak hour active users × (avg session length / 60 min)`

Example: 1,000 peak-hour users × (4 min / 60 min) ≈ 67 concurrent users.

## Transaction mix (per session)
| Action | % of sessions | Notes |
|---|---|---|
| Login | 100% | Entry point for every session |
| Account overview | 100% | Landing page after login |
| Transfer funds | TBD % | Only some sessions transfer |
| Logout / abandon | 100% | |

## Target load profile
| Test type | Arrival rate / VUs | Duration | Purpose |
|---|---|---|---|
| Load | TBD req/s or VUs | 10 min | Confirm normal-traffic latency/throughput |
| Stress | Ramp to Nx load | until failure | Find the ceiling |
| Spike | Jump to Nx for 1 min | 1 min spike + recovery | Check recovery behaviour |
| Soak | Normal load | 1–2+ hours | Catch leaks/degradation over time |

## Known limits of this environment
- ParaBank is a shared public demo — results reflect *perceived* load on a third-party
  server + network, not a controlled environment. Treat absolute numbers cautiously;
  focus on relative comparisons and on the mechanics (scripting, reporting, bottleneck
  analysis) rather than production-grade conclusions.
