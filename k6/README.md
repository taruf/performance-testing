# k6 scripts — ParaBank

## Install k6
- Windows: `winget install k6` or `choco install k6` (or download from k6.io).
- Verify: `k6 version`

## Run

```powershell
# from the k6/ directory, against a self-hosted instance
k6 run -e BASE_URL=http://<host>:8080/parabank -e TEST_TYPE=load scenarios/login.js
k6 run -e BASE_URL=http://<host>:8080/parabank -e TEST_TYPE=stress scenarios/login.js
k6 run -e BASE_URL=http://<host>:8080/parabank -e TEST_TYPE=spike scenarios/account-overview.js
k6 run -e BASE_URL=http://<host>:8080/parabank -e TEST_TYPE=soak -e SOAK_DURATION=1h -e SOAK_VUS=10 scenarios/transfer.js
```

Env vars:
- `TEST_TYPE` — `load` | `stress` | `spike` | `soak` (default `load`). See
  [lib/scenarios.js](lib/scenarios.js) for the stage definitions per type.
- `BASE_URL` — defaults to the public ParaBank demo
  (`https://parabank.parasoft.com/parabank`); point it at a self-hosted instance for
  any real run (see Notes below).
- `DEMO_USERNAME`, `DEMO_PASSWORD` — the seeded ParaBank account every VU logs in as
  (default `john` / `demo`).
- `SOAK_DURATION`, `SOAK_VUS` — only for `TEST_TYPE=soak`.

## Notes
- The public demo sits behind Cloudflare and rate-limits scripted traffic (HTTP 429,
  body `error code: 1015`) well below any useful load level — confirmed by running
  `login.js` against it directly. Point `BASE_URL` at a self-hosted instance (e.g. the
  official `parasoft/parabank` Docker image) for any real load/stress/spike/soak run.
- `register.htm` consistently returns HTTP 500 on the official `parasoft/parabank`
  Docker image, so scripts log in as a seeded account (`DEMO_USERNAME`/`DEMO_PASSWORD`)
  instead of registering throwaway users. `registerUser()` is still in
  [lib/parabank.js](lib/parabank.js) for targets where registration works.
- `overview.htm`/`transfer.htm` render static shells; real account data and transfers go
  through a REST API (`services_proxy/bank/...`) called client-side — `getOverview()`
  and `transfer()` hit that API directly rather than scraping server-rendered HTML.
- HTML report: add `--out json=results.json` then convert, or use `k6 run --out
  csv=results.csv` / the `k6-reporter` lib if you want a standalone HTML file without
  Grafana (that comes later, via docker-compose in [grafana/](../grafana/)).
