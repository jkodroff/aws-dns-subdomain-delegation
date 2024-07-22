# aws-dns-subdomain-delegation

Pulumi program for delegating subdomains for a hosted zone in Route 53:

- `domain-account-role` creates a role that be assumed by a number of accounts to add the necessary records to delegate a subdomain:
  - The config value `hostedZoneId` must be set to the hosted zone ID for `example.com`.
- `subdomain-account` contains the code to be run in AWS accounts that wish to have a delegated subdomain, e.g. `foo.example.com`:
- `subdomain-account-workload` contains a simple S3 static site configured to be at the `www.` sub-subdomain of the delegated subdomain, e.g. `www.foo.example.com`:
  - This stack is presumed to execute in the same Pulumi order as `subdomain-account`.

## Instructions for Delegating a Subdomain

In the `subdomain-account` directory:

1. Set the FQDN of the subdomain, e.g.:

    ```bash
    # First name, handle, username, etc.
    pulumi config set subdomainFqdn yourname.pulumi-workshops.com
    ```

1. Set the assumable role ARN (get this from the instructors), e.g.

    ```bash
    pulumi config set parentZoneRoleArn arn:aws:iam::123456789012:role/role-name
    ```

1. Run the Pulumi program:

    ```bash
    pulumi up
    ```

1. Optionally **if your org allows publicly readable S3 sites**, you can verify the configuration of your subdomain by deploying a simple S3 site:

    ```bash
    cd ../subdomain-account-workload
    pulumi up -y
    ```

    Test by running the following command:

    ```bash
    curl $(pulumi stack output url)
    ```

    You should see the following response:

    ```text
    <html>

    <head>
      <meta charset="UTF-8">
      <title>It works!</title>
    </head>

    <body>
      <h1>It works!</h1>
    </body>

    </html>
    ```
