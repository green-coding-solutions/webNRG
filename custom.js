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

        const data = await fetchData();

        data.forEach(item => {
            document.querySelector('#websites').insertAdjacentHTML(
                'beforeend',
                `<div class="ui yellow segment"><a class="ui label" href="https://metrics.green-coding.io/stats.html?id=${item[0]}">${item[1]} <i class="link icon"></i></a> (${(new Date(item[4])).toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })})
                    <hr>
                    <div class="badge-container">
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=cpu_energy_rapl_msr_component" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=network_energy_formula_global" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=cpu_power_rapl_msr_component" loading="lazy">
                        </a>
                        <a href="http://metrics.green-coding.io/stats.html?id=${item[0]}">
                            <img src="https://api.green-coding.io/v1/badge/single/${item[0]}?metric=network_carbon_formula_global" loading="lazy">
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
