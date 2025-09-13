"use strict";

async function fetchRunData(id) {

    let phase_stats_data;

    try {
        const response = await fetch(`https://api.green-coding.io/v1/compare?ids=${id}`);
        if (response.status != 200) {
            alert('Could not fetch energy and carbon data for tested websites from API')
            console.error('Error fetching data:', status);
            return
        }
        return response.json()
    } catch (error) {
        alert('Could not fetch energy and carbon data for tested websites from API')
        console.error('Error fetching data:', error);
        return
    }
}

function displayRunData(run_data) {
    const data = run_data.data
    const uuid = data['comparison_identifiers'][0]
    console.log(data);
    const [total_duration_s, cpu_energy_mWh, cpu_power_W, network_data_MB, network_carbon_g, network_carbon_g_10k] = parsePhaseStats(data)

    const [energy_class, energy_color, network_carbon_class, network_carbon_color] = classifyWebsite(cpu_power_W, network_carbon_g)

    document.querySelectorAll('.website-duration').forEach(el => el.innerText =  `${total_duration_s} s`)
    document.querySelector('.website-network-data').innerText = `${network_data_MB} MB`
    document.querySelector('.website-network-carbon-10k').innerText = `${network_carbon_g_10k} g`
    document.querySelector('.website-network-data-class').innerText = network_carbon_class
    document.querySelector('.website-network-data-class').classList.add(network_carbon_color)

    document.querySelector('.website-energy').innerText = `${cpu_energy_mWh} mWh`
    document.querySelector('.website-power').innerText = `${cpu_power_W} W`
    document.querySelector('.website-energy-class').innerText = energy_class
    document.querySelector('.website-energy-class').classList.add(energy_color)

    document.querySelector('.website-energy-10k').innerText = `${cpu_energy_mWh/100} kWh`


    document.querySelector('.website-name').innerText = data['common_info']['Usage Scenario']

}

(async () => {

    bindClose()

    const id = new URL(window.location.href).searchParams.get('id');
    const run_data = await fetchRunData(id);
    if (run_data == undefined) return; // happens if request ist 204
    displayRunData(run_data);

})()
