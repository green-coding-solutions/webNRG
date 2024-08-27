
const { v4: uuidv4 } = require('uuid');

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { headers } = request;
    const contentType = headers.get('content-type') || '';

    if (url.pathname.startsWith('/save') && contentType.includes('application/json')) {

      const json_body = await request.json();

      async function handleRequest(website, email, pages) {
          const owner = 'green-coding-solutions';
          const repo = 'website-tester';
          const uuid = uuidv4();

          const path = `submitted/${website}-${uuid}.yml`;
          const branch = 'main'; // Or any other branch you want to commit to

          // Replace this token with a personal access token with repo access
          const token = env['github-pat'];

          // Content for the new file
          let fileContent = `
---
name: The ${website} Website Test
author: Unknown
description: Opens the ${website} page, waits for full load

sci:
  R_d: Website load

compose-file: !include compose.yml

flow:

  - name: Create named pipe
    container: gcb-playwright
    commands:
      - type: console
        command: mkfifo /tmp/my_fifo

  - name: Startup
    container: gcb-playwright
    commands:
      - type: console
        detach: true
        command: python3 /tmp/repo/visit.py
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true

  - name: Pause
    container: gcb-playwright
    commands:
      - type: console
        command: sleep 2
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true


  - name: Warmup
    container: gcb-playwright
    commands:
      - type: console
        shell: bash
        command: echo "https://${website}" > /tmp/my_fifo
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true`

          pages.forEach(el => {
              fileContent = `${fileContent}

  - name: Step ${el}
    container: gcb-playwright
    commands:
      - type: console
        shell: bash
        command: echo "https://${el}" > /tmp/my_fifo && sleep 5
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true`
          })

          fileContent = `${fileContent}

  - name: Dump Log
    container: squid
    commands:
      - type: console
        command: cat /apps/squid/var/logs/access.log
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true
`;

          // GitHub API endpoint for creating or updating a file
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

          // Prepare the request to create or update the file
          const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Added ${website} test`,
              content: btoa(fileContent), // Encode file content to base64
              branch: branch,
            }),
          });

          if (!response.ok) {
            return new Response('Failed to add file to GitHub repository', { status: response.status });
          }

          add_job_response = await addJob(website, path, email);

          return new Response('File added to GitHub repository successfully', { status: 200 });
      }

      async function addJob(website, path, email) {
        // Prepare the request to create or update the file
        const response = await fetch('https://api.green-coding.io/v1/software/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: path,
            email: email,
            branch: 'intercept-cache-proxy',
            machine_id: 7,
            name: website,
            schedule_mode: 'one-off',
            url: 'https://github.com/green-coding-solutions/website-tester'

          }),
        });

        if (!response.ok) {
          return new Response('Failed to add file to GitHub repository', { status: response.status });
        }

        return new Response('File added to GitHub repository successfully', { status: 200 });
      }

      handleRequest(json_body['pages'][0], json_body['email'], json_body['pages'])

      return new Response('Ok');
    }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  },
}



// for testing only
// (async () => {
//     console.log(await handleRequest('www.google.de', 'arne@datafuse.de', ["page2"]))
// })();
