"use strict";

function truncate(str, maxLength=48) {
  return str.length > maxLength
    ? str.slice(0, maxLength) + '…'
    : str;
}

function normalizeUrl(url) {
    const hasProtocol = /^https?:\/\//i.test(url);
    const fullUrl = hasProtocol ? url : 'https://' + url;
    new URL(fullUrl); // will throw if invalid
    return fullUrl;
}


// Function to fetch data from the API and output JSON
async function fetchData() {
    const apiUrl = 'https://api.green-coding.io/v2/runs?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fgreen-metrics-tool&filename=templates%2Fwebsite%2Fusage_scenario_cached.yml&failed=false&limit=10';

    try {
        const  response = await fetch(apiUrl);

        if (!response.ok) {
            alert('Could not fetch list with last tested websites from API.')
            console.error('Error fetching data:', response);
            return
        }

        const response_body = await response.json();
        return response_body.data

    } catch (error) {
        alert('Could not fetch data with last runs from API.')
        console.error('Error fetching data:', error);
  }
}

/* Legacy
function addField() {
    const container = document.getElementById('inputs-container');
    const cloned_node = document.querySelector('#clonable-input-container .field').cloneNode(true);
    container.appendChild(cloned_node);
}

function removeField(button) {
    const groupToRemove = button.parentNode;
    groupToRemove.parentNode.removeChild(groupToRemove);
}
*/


(async () => {

        document.querySelectorAll(".close.icon").forEach(link => {
            link.addEventListener("click", function(event) {
                event.preventDefault(); // Prevent default navigation if needed
                this.parentElement.remove(); // Remove the parent container
            });
        });

        let phase_stats_data;
        const runs_data = await fetchData();
        if (runs_data == undefined) return;

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

            const cpu_power = data?.['data']?.['[RUNTIME]']?.['data']?.['cpu_power_rapl_msr_component']?.['data']?.['Package_0']?.['data']?.[uuid]?.['mean'];
            const cpu_power_W = cpu_power / 1_000;
            const total_duration = data?.['data']?.['[RUNTIME]']?.['data']?.['phase_time_syscall_system']?.['data']?.['?.[SYSTEM]']?.['data']?.[uuid]?.['mean'];
            const network_transfer = data?.['data']?.['[RUNTIME]']?.['data']?.['network_total_cgroup_container']?.['data']?.['gmt-playwright-nodejs']?.['data']?.[uuid]?.['mean'];
            const network_transfer_kb = network_transfer/1000;

            let rendering_power_html;
            let network_transfer_html;

            const cpu_idle_power = 2.45

            if (cpu_power_W > cpu_idle_power*2.5) {
                rendering_power_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li>C</li><li>D</li><li>E</li><li class="color-score-current">F</li></ul>';
            } else if (cpu_power_W >= cpu_idle_power*2.25) {
                rendering_power_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li>C</li><li>D</li><li class="color-score-current">E</li><li>F</li></ul>';
            } else if (cpu_power_W >= cpu_idle_power*2) {
                rendering_power_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li>C</li><li class="color-score-current">D</li><li>E</li><li>F</li></ul>';
            } else if (cpu_power_W >= cpu_idle_power*1.75) {
                rendering_power_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li class="color-score-current">C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else if (cpu_power_W >= cpu_idle_power*1.5) {
                rendering_power_html = '<ul class="color-score"><li>A+</li><li>A</li><li class="color-score-current">B</li><li>C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else if (cpu_power_W >= cpu_idle_power*1.25) {
                rendering_power_html = '<ul class="color-score"><li>A+</li><li class="color-score-current">A</li><li>B</li><li>C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else if (cpu_power_W > 0 && cpu_power_W < cpu_idle_power*1.25) {
                rendering_power_html = '<ul class="color-score"><li class="color-score-current">A+</li><li>A</li><li>B</li><li>C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else {
                console.error('Could not determine rendering power for ', runs_data[idx][7]['__GMT_VAR_PAGE__'], '. Value: ', cpu_power_W);
                rendering_power_html = 'N/A';
            }

            // we mimic the SWD model: https://sustainablewebdesign.org/digital-carbon-ratings
            if (network_transfer_kb > 0 && network_transfer_kb < 272.51) {
                network_transfer_html = '<ul class="color-score"><li class="color-score-current">A+</li><li>A</li><li>B</li><li>C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else if (network_transfer_kb <= 531.15) {
                network_transfer_html = '<ul class="color-score"><li>A+</li><li class="color-score-current">A</li><li>B</li><li>C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else if (network_transfer_kb <= 975.85) {
                network_transfer_html = '<ul class="color-score"><li>A+</li><li>A</li><li class="color-score-current">B</li><li>C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else if (network_transfer_kb <= 1410.39) {
                network_transfer_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li class="color-score-current">C</li><li>D</li><li>E</li><li>F</li></ul>';
            } else if (network_transfer_kb <= 1875.01) {
                network_transfer_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li>C</li><li class="color-score-current">D</li><li>E</li><li>F</li></ul>';
            } else if (network_transfer_kb <= 2419.56) {
                network_transfer_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li>C</li><li>D</li><li class="color-score-current">E</li><li>F</li></ul>';
            } else if (network_transfer_kb > 2419.56) {
                network_transfer_html = '<ul class="color-score"><li>A+</li><li>A</li><li>B</li><li>C</li><li>D</li><li>E</li><li class="color-score-current">F</li></ul>';
            } else {
                console.error('Could not determine network transfer for ', runs_data[idx][7]['__GMT_VAR_PAGE__'], '. Value: ', network_transfer_kb);
                network_transfer_html = 'N/A';
            }

            let usage_scenario_variables = Object.entries(runs_data[idx][7]).map(([k, v]) => typeof(v) == 'number' ? `"${k}": ${v}` : `"${k}": ${JSON.stringify(v)}`).join(', ')
            usage_scenario_variables = `{${usage_scenario_variables}}`

            const html_content = `
                <tr>
                    <td class="single line">${truncate(runs_data[idx][7]['__GMT_VAR_PAGE__'])}</td>
                    <td>${(new Date(runs_data[idx][4])).toLocaleDateString(navigator.language, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td class="single line">
                        ${rendering_power_html}
                    </td>
                    <td class="single line">
                        ${network_transfer_html}
                    </td>
                    <td>
                        <a href="https://metrics.green-coding.io/timeline.html?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fgreen-metrics-tool&amp;branch=main&amp;machine_id=6&amp;filename=templates%2Fwebsite%2Fusage_scenario_cached.yml&amp;usage_scenario_variables=${encodeURIComponent(usage_scenario_variables)}&amp;metrics=key" class="ui teal horizontal label  no-wrap"><i class="ui icon clock"></i>History &nbsp;</a>
                    </td>
                    <td>
                        <a class="ui button" href="https://metrics.green-coding.io/stats.html?id=${runs_data[idx][0]}" target='_blank' rel='noopener'>Details</a>
                    </td>
                </tr>`;
            document.querySelector('#websites').insertAdjacentHTML('beforeend', html_content);
        });

        // Prevent form submission (for demonstration purposes)
        document.querySelector('#page-form').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            try {
                var dataToSend = {
                    email: formData.get('email'),
                    page: normalizeUrl(formData.get('page')),
                    mode: 'website',
                    schedule_mode: formData.get('schedule_mode'),
                };
            } catch (error) {
                alert('URL is invalid. Please enter a valid URL.')
                return;
            }

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
