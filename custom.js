// Function to fetch data from the API and output JSON
async function fetchData() {
    const apiUrl = 'https://api.green-coding.io/v1/runs?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fwebsite-tester&limit=50';

    try {
        const  response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return response

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

        const response = fetchData();

        response.forEach(item => {
            document.querySelector('#websites').insertAdjacentHTML(
                'beforeend',
                `<div class="ui yellow segment"><a class="ui label" href="https://metrics.green-coding.io/stats.html?id=${item[0]}">${item[1]} <i class="link icon"></i></a> (${(new Date(item[4])).toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })})</div>`,

            );
        });

        // Prevent form submission (for demonstration purposes)
        document.querySelector('#page-form').onsubmit = async function(e) {
            e.preventDefault();
            const formData = new FormData(this);

            try {
                const response = await fetch('https://website-tester.green-coding.io/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth': 'DEFAULT'
                    },
                    body: JSON.stringify({"email": formData.get('email'), pages: formData.getAll('pages[]')})
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Success:', result);
                alert('POST request successful! Check console for details.');
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Check console for details.');
            }

        };

})()
