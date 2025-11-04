"use strict";

(async () => {

        document.querySelectorAll(".close.icon").forEach(link => {
            link.addEventListener("click", function(event) {
                event.preventDefault(); // Prevent default navigation if needed
                this.parentElement.remove(); // Remove the parent container
            });
        });

        let phase_stats_data;
        const runs_data = await fetchData();
        if (runs_data == undefined) {
            alert('Could not fetch list with last tested websites from API.')
            return
        }

        const urls = runs_data.map(el => fetch(`https://api.green-coding.io/v1/phase_stats/single/${el[0]}`))
        try {
            const responses = await Promise.all(urls);
            phase_stats_data = await Promise.all(responses.map(res => res.status === 200 ? res.json() : null));
        } catch (error) {
            alert('Could not fetch energy and carbon data for last tested websites from API')
            console.error('Error fetching data:', error);
            return
        }
        phase_stats_data.forEach((json, idx) => {
            if (json == undefined) return; // happens if request ist 204
            const data = json.data;
            const uuid = data?.['comparison_identifiers']?.[0];
            const page = runs_data[idx][7]['__GMT_VAR_PAGE__'];
            const usage_scenario_variables = runs_data[idx][7];

            const cpu_power = data?.['data']?.['[RUNTIME]']?.['data']?.['cpu_power_rapl_msr_component']?.['data']?.['Package_0']?.['data']?.[uuid]?.['mean'];
            const cpu_power_W = cpu_power / 1_000;
            const total_duration = data?.['data']?.['[RUNTIME]']?.['data']?.['phase_time_syscall_system']?.['data']?.['[SYSTEM]']?.['data']?.[uuid]?.['mean'];
            const network_transfer = data?.['data']?.['[RUNTIME]']?.['data']?.['network_total_cgroup_container']?.['data']?.['gmt-playwright-nodejs']?.['data']?.[uuid]?.['mean'];
            const network_transfer_kb = network_transfer/1000;

            const [rendering_power_html, network_transfer_html] = getRatings(cpu_power_W, network_transfer_kb);


            let usage_scenario_variables_json = Object.entries(usage_scenario_variables).map(([k, v]) => typeof(v) == 'number' ? `"${k}": ${v}` : `"${k}": ${JSON.stringify(v)}`).join(', ')
            usage_scenario_variables_json = `{${usage_scenario_variables_json}}`

            const html_content = `
                <tr>
                    <td class="single line">${truncate(page)}</td>
                    <td>${(new Date(runs_data[idx][4])).toLocaleDateString(navigator.language, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td class="single line">
                        ${rendering_power_html}
                    </td>
                    <td class="single line">
                        ${network_transfer_html}
                    </td>
                    <td>
                        <a href="https://metrics.green-coding.io/timeline.html?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fgreen-metrics-tool&amp;branch=main&amp;machine_id=6&amp;filename=templates%2Fwebsite%2Fusage_scenario_cached.yml&amp;usage_scenario_variables=${encodeURIComponent(usage_scenario_variables_json)}&amp;metrics=key" class="ui teal horizontal label  no-wrap"><i class="ui icon clock"></i>History &nbsp;</a>
                    </td>
                    <td>
                        <a class="ui button" href="details.html?page=${page}" target='_blank' rel='noopener'>Details</a>
                    </td>
                </tr>`;
            document.querySelector('#websites').insertAdjacentHTML('beforeend', html_content);
        });

        // Prevent form submission (for demonstration purposes)
        document.querySelector('#page-form').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            let normalized_url;
            try {
                 normalized_url = normalizeUrl(formData.get('page'));
             } catch (error) {
                alert('URL is invalid. Please enter a valid URL.')
                return;
            }

            // first we check if we already have a run in the last 30 days for this
            const last_run = await fetchData(1, normalized_url);
            if (last_run != null) {
                alert('We already have a run for this URL in the last 30 days - You will now be redirected to the details page');
                window.location = `/details.html?page=${encodeURIComponent(normalized_url)}`;
            }

            const dataToSend = {
                email: formData.get('email'),
                page: normalized_url,
                mode: 'website',
                schedule_mode: formData.get('schedule_mode'),
            };


            try {
                const response = await fetch('https://gateway.green-coding.io/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (!response.ok) {
                    alert(`Could not send data. HTTP error! status: ${response.status} and text: ${await response.text()} `);
                    console.error('Error:', response);
                    return
                }

            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Check console for details.');
                return
            }

            alert('Thanks, we have received your measurement request and will e-mail you shortly!', 'Success :)');

            // reset form
            document.querySelector('#page-form').reset()
        };
})()
