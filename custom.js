// Function to fetch data from the API and output JSON
async function fetchData() {
    const apiUrl = 'https://api.green-coding.io/v1/runs?uri=https%3A%2F%2Fgithub.com%2Fgreen-coding-solutions%2Fwebsite-tester&limit=50';

    try {
        // Fetch data from the API
        const  response = await fetch(apiUrl);

        // Check if response is successful
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Parse JSON data
        const data = await response.json();

        // Output JSON data
        console.log(data);
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
                    body: JSON.stringify({"email": formData.get('email'), pages: "email": formData.getAll('pages[]')})
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
