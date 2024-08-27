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

