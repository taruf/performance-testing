# Performance Testing — ParaBank

Hands-on performance testing practice against [ParaBank](https://github.com/parasoft/parabank),
Parasoft's demo banking app: workload modelling, load/stress/spike/soak testing with k6 and
JMeter, basic observability, and a deploy target on Azure with a CI performance gate.

## Structure
- [docs/](docs/) — fundamentals notes and a one-page workload model for the scenarios below.
- [k6/](k6/) — JavaScript load/stress/spike/soak scripts against ParaBank's login, account
  overview, and transfer flows.
- [jmeter/](jmeter/) — JMeter test plan mirroring the k6 scenarios.
- [grafana/](grafana/) — docker-compose for k6 results → InfluxDB/Prometheus → Grafana,
  plus container CPU/memory.
- [azure/](azure/) — ParaBank container deploy notes and budget alert setup.
- [.github/workflows/](.github/workflows/) — CI performance gate running k6 with p95/error-rate
  thresholds.

## Target under test
ParaBank demo app. Endpoints of interest: `login.htm`, `overview.htm`, `transfer.htm`.
The shared public demo (`parabank.parasoft.com`) rate-limits automated traffic via
Cloudflare, so `BASE_URL` is configurable — see [k6/README.md](k6/README.md) — to point
at a self-hosted instance (ParaBank's official `parasoft/parabank` Docker image) instead.
