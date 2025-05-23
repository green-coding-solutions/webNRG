// this file must be manually installed as cloudflare worker.

// using it as bundled worker with _worker.js did not work sadly :(


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { headers } = request;
    const contentType = headers.get('content-type') || '';

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://website-tester.green-coding.io",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "*",
    };

    if (request.method == 'OPTIONS') {
      return new Response('OK', { status: 200, headers: {...corsHeaders} });
    } else if (request.method == 'POST' && url.pathname.startsWith('/save') && contentType.includes('application/json')) {

      const uuid = crypto.randomUUID();
      const json_body = await request.json();
      const email = json_body['email']
      const pages = json_body['pages'].map(el => { // clean
          return el.replaceAll('https://', '').replaceAll('http://', '')
      })

      // website cannot contain any / so we just use the domain
      // we cannot use URL() as the URL might be broken
      const website = pages[0].split("/")[0]

      const path = `submitted/${website}-${uuid}.yml`;

      const owner = 'green-coding-solutions';
      const repo = 'website-tester';
      const branch = 'intercept-cache-proxy';
      const github_api_token = env['github-pat'];
      const gmt_api_token = env['gmt-api-token'];

      // Content for the new file
      let fileContent = `
---
name: The ${website} Website Test
author: Unknown
description: Opens the ${website} page, waits for full load

sci:
  R_d: Website load

services:
  gcb-playwright-proxy:
    image: greencoding/gcb_playwright:v17
  gcb-playwright-user:
    image: greencoding/gcb_playwright:v17

  squid:
    image: greencoding/squid_reverse_proxy:v1
    ports:
      - 3128:3128

flow:

  - name: Named pipe (proxy-cache-warmup)
    container: gcb-playwright-proxy
    commands:
      - type: console
        command: mkfifo /tmp/my_fifo_warmup
        hidden: true

  - name: Named pipe (user)
    container: gcb-playwright-user
    commands:
      - type: console
        command: mkfifo /tmp/my_fifo_run
        hidden: true

  - name: Startup (proxy-cache-warmup)
    container: gcb-playwright-proxy
    commands:
      - type: console
        detach: true
        command: python3 /tmp/repo/visit.py --fifo-path /tmp/my_fifo_warmup
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true
        hidden: true

  - name: Startup Browser
    container: gcb-playwright-user
    commands:
      - type: console
        detach: true
        command: python3 /tmp/repo/visit.py --fifo-path /tmp/my_fifo_run
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true


  - name: Pause (both)
    container: gcb-playwright-proxy
    commands:
      - type: console
        command: sleep 2
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true
        hidden: true`

          // technically we do not support multiple pages atm and when supplying this will fail in GMT due to name conflicts
          pages.forEach((el, index) => {
              fileContent = `${fileContent}

  - name: Warmup Proxy Caches and idle
    container: gcb-playwright-proxy
    commands:
      - type: console
        shell: bash
        command: echo "https://${el}" > /tmp/my_fifo_warmup && sleep 5
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true
        hidden: true`

          })

          // technically we do not support multiple pages atm and when supplying this will fail in GMT due to name conflicts
          pages.forEach((el, index) => {
              fileContent = `${fileContent}

  - name: Browse to and idle
    container: gcb-playwright-user
    commands:
      - type: console
        shell: bash
        command: echo "https://${el}" > /tmp/my_fifo_run && sleep 5
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true`
          })

          fileContent = `${fileContent}

  - name: Dump Log (proxy-cache-warmup)
    container: squid
    commands:
      - type: console
        command: cat /apps/squid/var/logs/access.log
        read-notes-stdout: true
        log-stdout: true
        log-stderr: true
        hidden: true
`;

      // GitHub API endpoint for creating or updating a file
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

      // Prepare the request to create or update the file
      const response_github = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${github_api_token}`,
          'User-Agent': 'Cloudflare Worker save-to-github',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Added ${website} test`,
          content: btoa(fileContent), // Encode file content to base64
          branch: branch,
        }),
      });

      if (!response_github.ok) {
        return new Response(`Could not add file to GitHub Repository. Status: ${response_github.status}. Message: ${response_github.text}`, {
            status: 500,
            statusText: `Could not add file to GitHub Repository. Status: ${response_github.status}. Message: ${response_github.text}`,
            headers: {...corsHeaders}
        });
      }


      // Insert job into cluster
      const response_job = await fetch('https://api.green-coding.io/v1/software/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authentication': gmt_api_token,
        },
        body: JSON.stringify({
          filename: path,
          email: email,
          branch: 'intercept-cache-proxy',
          machine_id: 6,
          name: website,
          schedule_mode: 'one-off',
          repo_url: 'https://github.com/green-coding-solutions/website-tester'

        }),
      });

      if (!response_job.ok) {
        return new Response(`Could not add file to Cluster Queue. Status: ${response_job.status}. Message: ${response_job.text}`, {
            status: 500,
            statusText: `Could not add file to Cluster Queue. Status: ${response_job.status}. Message: ${response_job.text}`,
            headers: {...corsHeaders}
        });
      }

      return new Response('{"status": "OK"}', {status: 200, headers: {...corsHeaders}});
    }
    // Otherwise, serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return new Response("Internal Server Error", {
        status: 500,
        statusText: "Invalid data submitted",
        headers: {...corsHeaders}
    });
  },
}
