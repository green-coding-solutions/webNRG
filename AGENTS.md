# AGENTS.md

## Project
**webNRG** (pronounced "web energy") is a static frontend that lets users submit a website URL (plus an optional e-mail and a one-off/weekly schedule). The URL is then measured on the Green Metrics Tool (GMT) cluster. The pages show rendering energy, network transfer and carbon for that URL.

- Live: https://website-tester.green-coding.io/
- Deployed to GitHub Pages via `.github/workflows/static.yml` on every push to `main`. The workflow uploads the whole repo root and has **no build step**.

## Stack
- Plain HTML + vanilla JS (`"use strict"`, async IIFEs). No bundler, no build, no tests, no linter.
- UI: a reduced Fomantic/Semantic UI bundle vendored in `dist/`. Do not edit it.
- `package.json` (`uuid`, `wrangler`) is left over from the Cloudflare worker. The pages do not use it.

## Key files
| Path | Purpose |
|------|---------|
| `index.html` + `js/code.js` | Submit form and the table of recently tested websites |
| `details.html` + `js/details.js` | Detail page for one URL: `details.html?page=<url>` |
| `methodology.html` | Static explanation of the measurement and the A+–F labels |
| `js/shared.js` | Shared helpers: `normalizeUrl`, `fetchData`, `getURLParams`, `getRatings`, `truncate` |
| `css/style.css` | Custom styles |

## Measurement pipeline / GMT integration
- **Submit:** `POST https://gateway.green-coding.io/save` with `{email, page, mode: 'website', schedule_mode}`. A Cloudflare worker handles this. The worker is **not in this repo**; it needs a GitHub PAT stored as the Cloudflare secret `github-pat` and uses it to create the job for GMT (see README).
- **Before submitting**, `code.js` checks whether a run for the URL exists from the last 30 days. If one does, it redirects to the details page.
- **Usage scenario:** runs use the GMT Playwright template
  https://github.com/green-coding-solutions/green-metrics-tool/tree/main/templates/website,
  specifically `templates/website/usage_scenario_cached.yml`. A local copy is in `/home/node/green-metrics-tool/templates/website/`.
  - Variables: `__GMT_VAR_PAGE__` (URL) and `__GMT_VAR_SLEEP__` (5).
  - Phases read by the frontend: `Visit page and idle for 5 s` and `Scroll down and wait for 5 s`. Container: `gmt-playwright-nodejs`.
  - If phase names, the container name or the sleep value change in the template, the lookups in `code.js`/`details.js` break.
- **Cluster:** runs execute on the GMT cluster, currently on **machine 6** (status: https://metrics.green-coding.io/cluster-status.html). `machine_id=6` is hardcoded in the timeline links in `code.js` and `details.js`.
- **Read API** (`api.green-coding.io`):
  - `/v2/runs?uri=...green-metrics-tool&filename=templates/website/usage_scenario_cached.yml&failed=false&usage_scenario_variables=<url>`. Row fields: `[0]` = run uuid, `[4]` = date, `[7]` = usage_scenario_variables object.
  - `/v1/phase_stats/single/<uuid>`. Values are at `data.data[<phase>].data[<metric>].data[<detail>].data[<uuid>].mean`.
- **Metrics read** (names must match GMT DB naming, where underscores separate scopes):
  - `cpu_energy_rapl_msr_component` and `cpu_power_rapl_msr_component` (detail `Package_0`)
  - `network_total_cgroup_container` (detail `gmt-playwright-nodejs`)
  - `network_carbon_formula_global` (detail `[FORMULA]`)
  - `phase_time_syscall_system` (detail `[SYSTEM]`)
  - `carbon_intensitylevel_electricitymaps_machine` (detail `electricity_maps`; levels 1 = Low, 2 = Moderate, 3 = High)
  - `carbon_intensity_elephant_machine` (gCO₂e/kWh; the first detail key is used)
- **Dashboard links:** `https://metrics.green-coding.io/stats.html?id=<uuid>` and `timeline.html?...`.

## Rating logic
- `getRatings(cpu_energy_mWh, network_transfer_kb)` in `js/shared.js` returns the HTML for the label strips.
- **Rendering:** A+ to F in 25% steps above `rendering_energy_best_mWh = 4.6788194` (2.45 W idle × 5.5 s / 3.6). Anything above 2.5× that is F.
- **Network:** uses the SWD digital-carbon-rating kB thresholds (272.51, 531.15, …, 2419.56).
- If you change thresholds, update `methodology.html` to match.
- Units: µJ → mWh is `/ 3_600_000`. The "10k" yearly figure means ×12 months × 10,000 views.

## Conventions / gotchas
- Match the existing style: 4-space indent, snake_case variables, optional chaining for all API data access. Never reformat unsolicited.
- HTML is injected via `innerHTML` / `insertAdjacentHTML`. Keep that in mind when rendering values from the API or from users.
- Known bug: the `else` error branches in `getRatings` reference `runs_data` / `idx`, which are undefined in that scope.
- Everything in the repo root is published to GitHub Pages. Do not commit secrets or scratch files.

## Local dev / Testing
```bash
python3 -m http.server 8000
```
- The API calls need CORS. Use a Chromium browser started with `--disable-web-security --user-data-dir=/tmp/...` (see README).
- Check manually: `http://localhost:8000/` (recent-runs table loads) and `http://localhost:8000/details.html?page=https://www.green-coding.io`.
