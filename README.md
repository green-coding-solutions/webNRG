This repository is live at https://website-tester.green-coding.io.

## What does it do?

The code is a simple HTML page that allows for entering a URL and an email that then will be tested
on the GMT cluster.

In order to get the test running GMT always needs a checked in *yml* file into a git repository.

This repository utilizes a cloudflare worker with a submitted GitHub Private-Access-Token (PAT) to 
submit a new yml file to the repository at https://github.com/green-coding-solutions/website-tester

## Important

You must also add the PAT token as a secret to cloudflare to make it work.
It is expected under the key 'github-pat'

## Test locally

- Start a local webserver serving the HTML files. Example for Python:
  + `$ python3 -m http.server 8000` 
- You can run Brave (or any Chromium Browser) to open local files without web security. Example for macOS:
  + `$ open -n -a /Applications/Brave\ Browser.app/Contents/MacOS/Brave\ Browser --args --user-data-dir="/tmp/brave_dev_sess_1" --disable-web-security --allow-running-insecure-content` 
- Then navigate to: `http://localhost:8000`