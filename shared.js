"use strict";

function bindClose() {
    document.querySelectorAll(".close.icon").forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent default navigation if needed
            this.parentElement.remove(); // Remove the parent container
        });
    });
}

function classifyWebsite(cpu_power, network_carbon) {
    let energy_class
    let energy_color
    let network_carbon_class
    let network_carbon_color

    if (cpu_power >= 4) {
        energy_class = 'F';
        energy_color = 'red'
    } else if (cpu_power >= 3.6) {
        energy_class = 'E';
        energy_color = 'orange'
    } else if (cpu_power >= 3.4) {
        energy_class = 'D';
        energy_color = 'yellow'
    } else if (cpu_power >= 3.2) {
        energy_class = 'C';
        energy_color = 'teal'
    } else if (cpu_power >= 3.0) {
        energy_class = 'B';
        energy_color = 'olive'
    } else if (cpu_power > 0.0 && cpu_power < 3.0) {
        energy_class = 'A';
        energy_color = 'green'
    } else {
        energy_class = 'N/A';
        energy_color = 'purple'
    }

    if (network_carbon > 0.01) {
        network_carbon_class = 'F';
        network_carbon_color = 'red'
    } else if (network_carbon >= 0.008) {
        network_carbon_class = 'E';
        network_carbon_color = 'orange'
    } else if (network_carbon >= 0.006) {
        network_carbon_class = 'D';
        network_carbon_color = 'yellow'
    } else if (network_carbon >= 0.004) {
        network_carbon_class = 'C';
        network_carbon_color = 'teal'
    } else if (network_carbon >= 0.002) {
        network_carbon_class = 'B';
        network_carbon_color = 'olive'
    } else if (network_carbon > 0 && network_carbon < 0.002) {
        network_carbon_class = 'A';
        network_carbon_color = 'green'
    } else {
        network_carbon_class = 'N/A';
        network_carbon_color = 'purple'
    }

    return [energy_class, energy_color, network_carbon_class, network_carbon_color]

}

function parsePhaseStats(data) {
    const uuid = data['comparison_identifiers'][0]

    const cpu_energy = data['data']['Load and idle']['cpu_energy_rapl_msr_component']['data']['Package_0']['data'][uuid]['mean']
    const cpu_energy_unit = data['data']['Load and idle']['cpu_energy_rapl_msr_component']['unit']

    const total_duration = data['data']['Load and idle']['phase_time_syscall_system']['data']['[SYSTEM]']['data'][uuid]['mean']
    const total_duration_unit = data['data']['Load and idle']['phase_time_syscall_system']['unit']

    const network_data = data['data']['Load and idle']['network_total_cgroup_container']['data']['gcb-playwright']['data'][uuid]['mean']
    const network_data_unit = data['data']['Load and idle']['network_total_cgroup_container']['unit']

    if (network_data_unit != 'Bytes') {
        alert(`Unexpected unit returned from API for network_data_unit: ${network_data_unit}`)
        throw data
    }

    if (cpu_energy_unit != 'uJ') {
        alert(`Unexpected unit returned from API for cpu_energy_unit: ${cpu_energy_unit}`)
        throw data
    }

    if (total_duration_unit != 'us') {
        alert(`Unexpected unit returned from API for total_duration_unit: ${total_duration_unit}`)
        throw data
    }


    const cpu_energy_mWh = (cpu_energy / 3600000)
    const cpu_power_W = (cpu_energy / total_duration)
    const network_data_MB = (network_data / 1e6)
    const network_carbon_g = (((network_data / 1e9) * 0.06)*300)
    const total_duration_s = (total_duration / 1e6)

    return [total_duration_s, cpu_energy_mWh, cpu_power_W, network_data_MB, network_carbon_g]
}