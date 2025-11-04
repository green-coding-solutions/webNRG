"use strict";

(async () => {

        const url_params = getURLParams()

        let normalized_url;
        try {
             normalized_url = normalizeUrl(url_params?.page);
         } catch (error) {
            alert('URL is invalid. Please enter a valid URL.')
            return;
        }

        // first we check if we already have a run in the last 30 days for this
        const last_run = await fetchData(1, normalized_url);
        if (last_run == null) {
            alert('A run for this URL does not exist. Did you follow a correct link?');
            return
        }

        const uuid = last_run[0][0];
        const usage_scenario_variables = last_run[0][7];
        const last_run_date = Date(last_run[0][4]);
        let usage_scenario_variables_json = Object.entries(usage_scenario_variables).map(([k, v]) => typeof(v) == 'number' ? `"${k}": ${v}` : `"${k}": ${JSON.stringify(v)}`).join(', ')
        usage_scenario_variables_json = `{${usage_scenario_variables_json}}`


        const phase_stats = await fetch(`https://api.green-coding.io/v1/phase_stats/single/${uuid}`).then(response => response.json())

        const data = phase_stats.data;

        const cpu_energy = data?.['data']?.['[RUNTIME]']?.['data']?.['cpu_energy_rapl_msr_component']?.['data']?.['Package_0']?.['data']?.[uuid]?.['mean'];
        const cpu_power = data?.['data']?.['[RUNTIME]']?.['data']?.['cpu_power_rapl_msr_component']?.['data']?.['Package_0']?.['data']?.[uuid]?.['mean'];
        const cpu_power_W = cpu_power / 1_000;
        const total_duration = data?.['data']?.['[RUNTIME]']?.['data']?.['phase_time_syscall_system']?.['data']?.['[SYSTEM]']?.['data']?.[uuid]?.['mean'];
        const network_transfer = data?.['data']?.['[RUNTIME]']?.['data']?.['network_total_cgroup_container']?.['data']?.['gmt-playwright-nodejs']?.['data']?.[uuid]?.['mean'];
        const network_transfer_kb = network_transfer/1000;
        const network_carbon = data?.['data']?.['[RUNTIME]']?.['data']?.['network_carbon_formula_global']?.['data']?.['[FORMULA]']?.['data']?.[uuid]?.['mean'];

        const [rendering_power_html, network_transfer_html] = getRatings(cpu_power_W, network_transfer_kb);


        document.querySelector('#website-name').textContent = usage_scenario_variables['__GMT_VAR_PAGE__'];
        document.querySelector('#last-run-date').textContent = last_run_date;
        document.querySelector('#rendering-power-label').innerHTML = rendering_power_html;
        document.querySelector('#network-transfer-label').innerHTML = network_transfer_html;

        document.querySelector('#rendering-power').textContent = `${cpu_power_W.toFixed(2)} W`;
        document.querySelector('#rendering-energy').textContent = `${(cpu_energy/3600/1000).toFixed(2)}  mWh`;
        document.querySelector('#rendering-energy-10k').textContent = `${(10*cpu_energy/3600/1000/1000).toFixed(2)}  kWh`;

        document.querySelectorAll('.measurement-duration').forEach(el => el.textContent = `${(total_duration/1e6).toFixed(2)} s`); // in s
        document.querySelector('#network-transfer').textContent = `${network_transfer_kb.toFixed(2)} kB`;
        document.querySelector('#network-carbon-10k-year').textContent = `${(10*12*network_carbon/1e6).toFixed(2)} kg`;

        document.querySelector('#measurement-details-link').href = `https://metrics.green-coding.io/stats.html?id=${uuid}`;
        document.querySelector('#timeline-link').href = `https://metrics.green-coding.io/timeline.html?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fgreen-metrics-tool&branch=main&machine_id=6&filename=templates%2Fwebsite%2Fusage_scenario_cached.yml&usage_scenario_variables=${encodeURIComponent(usage_scenario_variables_json)}&metrics=key`;





})()
