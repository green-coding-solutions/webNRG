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
        let idx = 0;
        phase_stats_data.forEach(json => {
            if (json == undefined) return; // happens if request ist 204
            const data = json.data;
            const uuid = data?.['comparison_identifiers']?.[0];

            let cpu_energy = data?.['data']?.['[RUNTIME]']?.['data']?.['cpu_energy_rapl_msr_component']?.['data']?.['Package_0']?.['data']?.[uuid]?.['mean'];
            const total_duration = data?.['data']?.['[RUNTIME]']?.['data']?.['phase_time_syscall_system']?.['data']?.['?.[SYSTEM]']?.['data']?.[uuid]?.['mean'];
            const network_transfer = data?.['data']?.['[RUNTIME]']?.['data']?.['network_io_cgroup_container']?.['data']?.['gmt-playwright-nodejs']?.['data']?.[uuid]?.['mean'];

            const cpu_power = (cpu_energy/total_duration).toFixed(2);
            const network_carbon = (((network_transfer / 1e9) * 0.06)*300*10000).toFixed(2);


            let energy_class;
            let energy_color;
            let network_carbon_class;
            let network_carbon_color;

            if (cpu_energy > 100) {
                energy_class = 'F';
                energy_color = 'red'
            } else if (cpu_energy >= 80) {
                energy_class = 'E';
                energy_color = 'orange'
            } else if (cpu_energy >= 60) {
                energy_class = 'D';
                energy_color = 'yellow'
            } else if (cpu_energy >= 40) {
                energy_class = 'C';
                energy_color = 'teal'
            } else if (cpu_energy >= 20) {
                energy_class = 'B';
                energy_color = 'olive'
            } else if (cpu_energy > 0 && cpu_energy < 20) {
                energy_class = 'A';
                energy_color = 'green'
            } else {
                energy_class = 'N/A';
                energy_color = 'purple'
            }

            if (network_carbon > 1) {
                network_carbon_class = 'F';
                network_carbon_color = 'red'
            } else if (network_carbon >= 0.8) {
                network_carbon_class = 'E';
                network_carbon_color = 'orange'
            } else if (network_carbon >= 0.6) {
                network_carbon_class = 'D';
                network_carbon_color = 'yellow'
            } else if (network_carbon >= 0.4) {
                network_carbon_class = 'C';
                network_carbon_color = 'teal'
            } else if (network_carbon >= 0.2) {
                network_carbon_class = 'B';
                network_carbon_color = 'olive'
            } else if (network_carbon > 0 && network_carbon < 0.2) {
                network_carbon_class = 'A';
                network_carbon_color = 'green'
            } else {
                network_carbon_class = 'N/A';
                network_carbon_color = 'purple'
            }

            document.querySelector('#websites').insertAdjacentHTML(
                'beforeend',
                `<div class="ui yellow segment"><a class="ui label" href="https://metrics.green-coding.io/stats.html?id=${runs_data[idx][0]}">${truncate(runs_data[idx][7]['__GMT_VAR_PAGE__'])} - (${(new Date(runs_data[idx][4])).toLocaleDateString(navigator.language, { year: 'numeric', month: 'short', day: 'numeric' })}) <i class="external alternate icon"></i></a>
                    <hr>
                    <div class="badge-container">
<a href="http://metrics.green-coding.io/stats.html?id=${runs_data[idx][0]}" target='_blank' rel='noopener'>
                <div class="ui label" style="
                        display: inline-block;
                        display: inline-flex;

                        gap: 16px;
                    ">
                        <div>
                    <div class="ui ${energy_color} label" style="margin-left: 13px; margin-bottom: 3px;"> ${energy_class} </div>
                        <div>Rendering</div>
                     </div>
                       <div>
                    <div class="ui ${network_carbon_color} label" style="
                        margin-left: 25px;
                        margin-bottom: 3px;
                    "> ${network_carbon_class}
                          </div>
                           <div>Network Data</div>
                            </div>
                        </div>
                </a>
                    </div>
                </div>`,
            );
            idx++;
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
