// Function to fetch data from the API and output JSON
async function fetchData() {
    const apiUrl = 'https://api.green-coding.io/v1/runs?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fwebsite-tester&limit=5';

    try {
        const  response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const response_body = await response.json();
        return response_body.data

    } catch (error) {
        console.error('Error fetching data:', error);
  }
}

function addField() {
    const container = document.getElementById('inputs-container');
    const cloned_node = document.querySelector('#clonable-input-container .field').cloneNode(true);
    container.appendChild(cloned_node);
}

function removeField(button) {
    const groupToRemove = button.parentNode;
    groupToRemove.parentNode.removeChild(groupToRemove);
}



(async () => {

        document.querySelectorAll(".close.icon").forEach(link => {
            link.addEventListener("click", function(event) {
                event.preventDefault(); // Prevent default navigation if needed
                this.parentElement.remove(); // Remove the parent container
            });
        });


        const data = await fetchData();

        data.forEach(item => {
            document.querySelector('#websites').insertAdjacentHTML(
                'beforeend',
                `<div class="ui yellow segment"><a class="ui label" href="https://metrics.green-coding.io/stats.html?id=${item[0]}">${item[1]} - (${(new Date(item[4])).toLocaleDateString(navigator.language, { year: 'numeric', month: 'short', day: 'numeric' })}) <i class="external alternate icon"></i></a>
                    <hr>
                    <div class="badge-container">
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}#RUNTIME__Browse%20to%20and%20idle">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=cpu_energy_rapl_msr_component&phase=Browse%20to%20and%20idle" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}#RUNTIME__Browse%20to%20and%20idle">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=network_energy_formula_global&phase=Browse%20to%20and%20idle" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}#RUNTIME__Browse%20to%20and%20idle">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=psu_energy_ac_xgboost_machine&phase=Browse%20to%20and%20idle" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}#RUNTIME__Browse%20to%20and%20idle">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=cpu_power_rapl_msr_component&phase=Browse%20to%20and%20idle" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}#RUNTIME__Browse%20to%20and%20idle">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=network_carbon_formula_global&phase=Browse%20to%20and%20idle" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}#RUNTIME__Browse%20to%20and%20idle">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=psu_power_ac_xgboost_machine&phase=Browse%20to%20and%20idle" loading="lazy">
                        </a>
                    </div>
                </div>`,

            );
        });

        // Prevent form submission (for demonstration purposes)
        document.querySelector('#page-form').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            try {
                const response = await fetch('https://save-to-github.arne5926.workers.dev/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({"email": formData.get('email'), pages: formData.getAll('pages[]')})
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} and text: ${await response.text()} `);
                }

                const result = await response.json();
                alert('Thanks, we have received your measurement request and will e-mail you shortly!');

                // reset form
                document.querySelector('#page-form').reset()
                // remove all extra pages
                document.querySelectorAll('#inputs-container a.ui.left.icon.label.red').forEach(el => el.click())
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Check console for details.');
            }

        };

})()
