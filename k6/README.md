# k6 scripts — ParaBank

## Install k6
- Windows: `winget install k6` or `choco install k6` (or download from k6.io).
- Verify: `k6 version`

## Run

```powershell
# from the k6/ directory
k6 run -e TEST_TYPE=load scenarios/login.js
k6 run -e TEST_TYPE=stress scenarios/login.js
k6 run -e TEST_TYPE=spike scenarios/account-overview.js
k6 run -e TEST_TYPE=soak -e SOAK_DURATION=1h -e SOAK_VUS=10 scenarios/transfer.js
```

Env vars:
- `TEST_TYPE` — `load` | `stress` | `spike` | `soak` (default `load`). See
  [lib/scenarios.js](lib/scenarios.js) for the stage definitions per type.
- `USER_COUNT` — how many throwaway ParaBank users to register in `setup()` (default 20).
  Each VU reuses one registered user for the whole run.
- `BASE_URL` — defaults to the public ParaBank demo
  (`https://parabank.parasoft.com/parabank`).
- `SOAK_DURATION`, `SOAK_VUS` — only for `TEST_TYPE=soak`.

## Notes
- The public demo sits behind Cloudflare and rate-limits scripted traffic (HTTP 429,
  body `error code: 1015`) well below any useful load level — confirmed by running
  `login.js` against it directly. Point `BASE_URL` at a self-hosted instance (e.g. the
  official `parasoft/parabank` Docker image) for any real load/stress/spike/soak run.
- `setup()` registers real (throwaway) customer records against whatever `BASE_URL`
  points at. Keep `USER_COUNT` sane and don't hammer a shared instance unnecessarily.
- `lib/parabank.js` has one unverified TODO: the `transfer.htm` flow currently transfers
  from an account to itself because a fresh ParaBank customer only has one account by
  default. Verify field names against a real logged-in session before trusting results
  from `transfer.js`.
- HTML report: add `--out json=results.json` then convert, or use `k6 run --out
  csv=results.csv` / the `k6-reporter` lib if you want a standalone HTML file without
  Grafana (that comes later, via docker-compose in [grafana/](../grafana/)).
