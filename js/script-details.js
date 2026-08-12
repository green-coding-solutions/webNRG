"use strict";

const SCRIPT_PHASE = 'Run Playwright path';
const SCRIPT_FILENAME = 'templates/website/usage_scenario_playwright_js_cached.yml';
const POLL_INTERVAL_MS = 30_000;
const POLL_MAX_MS = 90 * 60 * 1000; // runs that take longer than this will not have failed, we just stop waiting

(async () => {
    const url_params = getURLParams();
    const job_id = url_params?.job_id;

    const waiting_el = document.querySelector('#script-waiting');
    const error_el = document.querySelector('#script-error');
    const results_el = document.querySelector('#script-results');

    const showError = (message, uuid=null) => {
        waiting_el.style.display = 'none';
        error_el.style.display = '';
        document.querySelector('#script-error-message').textContent = message;
        const link = document.querySelector('#error-details-link');
        if (uuid == null) {
            link.parentElement.style.display = 'none';
        } else {
            link.href = `https://metrics.green-coding.io/stats.html?id=${uuid}`;
        }
    };

    if (job_id == null || !/^\d+$/.test(job_id)) {
        showError('This link is missing a valid job id. Did you follow a correct link?');
        return;
    }

    // The run only shows up once the job has been picked up by a measurement machine and has finished
    const started_at = Date.now();
    let run = null;
    while (run == null) {
        try {
            run = await fetchRunByJobId(job_id);
        } catch (error) {
            console.error('Error:', error);
            showError('Could not reach the API to check on your measurement. Please reload this page in a few minutes.');
            return;
        }

        if (run != null) break;

        if (Date.now() - started_at > POLL_MAX_MS) {
            showError('Your measurement is taking unusually long. It is most likely still queued - please reload this page later.');
            return;
        }

        document.querySelector('#waiting-duration').textContent = Math.round((Date.now() - started_at) / 60_000);
        await sleep(POLL_INTERVAL_MS);
    }

    const uuid = run[0];
    const usage_scenario_variables = run[7];
    const failed = run[11];
    const last_run_date = new Date(run[4]);

    if (failed === true) {
        showError('Your Playwright path could not be measured. The most common reasons are a command that does not match the page or a path that takes longer than 60 seconds.', uuid);
        return;
    }

    let phase_stats_response;
    try {
        phase_stats_response = await fetch(`https://api.green-coding.io/v1/phase_stats/single/${uuid}`);
    } catch (error) {
        console.error('Error:', error);
        showError('Could not fetch the measurement results from the API. Please reload this page in a few minutes.', uuid);
        return;
    }

    if (!phase_stats_response.ok || phase_stats_response.status == 204) {
        showError('The measurement finished, but no results are available (yet). Please reload this page in a few minutes.', uuid);
        return;
    }

    const data = (await phase_stats_response.json()).data;
    const phase_data = data?.['data']?.[SCRIPT_PHASE]?.['data'];

    if (phase_data == null) {
        showError('The measurement finished, but did not contain any data for your Playwright path.', uuid);
        return;
    }

    const cpu_energy_uJ = phase_data?.['cpu_energy_rapl_msr_component']?.['data']?.['Package_0']?.['data']?.[uuid]?.['mean'];
    const cpu_energy_mWh = cpu_energy_uJ/3_600_000;

    const cpu_power_mW = phase_data?.['cpu_power_rapl_msr_component']?.['data']?.['Package_0']?.['data']?.[uuid]?.['mean'];
    const cpu_power_W = cpu_power_mW/1_000;

    const total_duration_us = phase_data?.['phase_time_syscall_system']?.['data']?.['[SYSTEM]']?.['data']?.[uuid]?.['mean'];
    const total_duration_s = total_duration_us/1e6;

    const network_transfer_bytes = phase_data?.['network_total_cgroup_container']?.['data']?.['gmt-playwright-nodejs']?.['data']?.[uuid]?.['mean'];
    const network_transfer_kb = network_transfer_bytes/1000;

    const network_carbon_ug = phase_data?.['network_carbon_formula_global']?.['data']?.['[FORMULA]']?.['data']?.[uuid]?.['mean'];
    const network_carbon_g = network_carbon_ug/1_000_000;

    const INTENSITY_LEVEL_MAP = {
        1: { label: 'Low',      color: 'green'  },
        2: { label: 'Moderate', color: 'yellow' },
        3: { label: 'High',     color: 'red' },
    };
    // In DB this is the naming (merged) as underscores separate scopes / domains
    const carbon_intensity_level = phase_data?.['carbon_intensitylevel_electricitymaps_machine']?.['data']?.['electricity_maps']?.['data']?.[uuid]?.['mean'];

    const carbon_intensity_data = phase_data?.['carbon_intensity_elephant_machine']?.['data'];
    const carbon_intensity_detail = carbon_intensity_data ? Object.keys(carbon_intensity_data)[0] : null;
    const carbon_intensity_gco2_kwh = carbon_intensity_detail
        ? carbon_intensity_data?.[carbon_intensity_detail]?.['data']?.[uuid]?.['mean']
        : null;

    const page = usage_scenario_variables?.['__GMT_VAR_PAGE__'];

    document.title = `webNRG - Playwright path for ${page}`;
    document.querySelector('#website-name').textContent = page;
    document.querySelector('#last-run-date').textContent = last_run_date;

    const formatOrUnknown = (value, formatter) => (Number.isFinite(value) ? formatter(value) : 'N/A');

    document.querySelector('#rendering-power').textContent = formatOrUnknown(cpu_power_W, (v) => `${v.toFixed(2)} W`);
    document.querySelector('#measurement-duration').textContent = formatOrUnknown(total_duration_s, (v) => `${v.toFixed(2)} s`);
    document.querySelector('#rendering-energy').textContent = formatOrUnknown(cpu_energy_mWh, (v) => `${v.toFixed(2)} mWh`);
    document.querySelector('#network-transfer').textContent = formatOrUnknown(network_transfer_kb, (v) => `${v.toFixed(2)} kB`);
    document.querySelector('#network-carbon').textContent = formatOrUnknown(network_carbon_g, (v) => `${v.toFixed(4)} gCO₂e`);
    document.querySelector('#carbon-intensity-value').textContent = formatOrUnknown(carbon_intensity_gco2_kwh, (v) => `${Math.round(v)} gCO₂e/kWh`);

    const intensity_el = document.querySelector('#carbon-intensity-level');
    const level = carbon_intensity_level != null ? INTENSITY_LEVEL_MAP[Math.round(carbon_intensity_level)] : null;
    if (level) {
        intensity_el.textContent = level.label;
        intensity_el.classList.add(level.color);
    } else {
        intensity_el.style.display = 'none';
    }

    const script_base64 = usage_scenario_variables?.['__GMT_VAR_SCRIPT_B64__'];
    if (script_base64 != null) {
        document.querySelector('#script-source').textContent = decodeBase64(script_base64);
    }

    const usage_scenario_variables_params = Object.entries(usage_scenario_variables)
        .map(([k, v]) => `usage_scenario_variables[${k}]=${encodeURIComponent(v)}`)
        .join('&');

    document.querySelector('#measurement-details-link').href = `https://metrics.green-coding.io/stats.html?id=${uuid}`;
    document.querySelector('#timeline-link').href = `https://metrics.green-coding.io/timeline.html?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fgreen-metrics-tool&branch=main&machine_id=6&filename=${encodeURIComponent(SCRIPT_FILENAME)}&${usage_scenario_variables_params}&phase=${encodeURIComponent(SCRIPT_PHASE)}&metrics=key`;

    waiting_el.style.display = 'none';
    results_el.style.display = '';

})()
