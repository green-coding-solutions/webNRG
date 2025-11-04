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
    return fullUrl.replace(/\/+$/, ""); // remove trailing slashes
}


// Function to fetch data from the API and output JSON
async function fetchData(limit=10, usage_scenario_variables='') {
    const apiUrl = `https://api.green-coding.io/v2/runs?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fgreen-metrics-tool&filename=templates%2Fwebsite%2Fusage_scenario_cached.yml&failed=false&usage_scenario_variables=${encodeURIComponent(usage_scenario_variables)}&limit=${limit}`;


    let json_response;
    return (await fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            console.error('Error fetching data:', response);
            return
        }
        if (response.status == 204) {
            // 204 responses use no body, so json() call would fail
            console.log('No data to display. API returned empty response (HTTP 204)')
            return
        }

        return response.json()
    }))?.data

}


const getURLParams = () => {
    const url_params = new URLSearchParams(window.location.search);
    if (!url_params.size) return {};
    return Object.fromEntries(url_params.entries())
}

const getRatings = (cpu_power_W, network_transfer_kb) => {
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

    return [rendering_power_html, network_transfer_html];
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
