# aws-dns-subdomain-delegation

Demo using Pulumi for delegating subdomains for a hosted zone in Route 53:

- `domain-account` contains the code for the AWS account that owns the top-level Route 53 Hosted Zone, e.g. `example.com`:
  - The config value `hostedZoneId` must be set to the hosted zone ID for `example.com`.
- `subdomain-account` contains the code to be run in AWS accounts that wish to have a delegated subdomain, e.g. `foo.example.com`:
  - This stack is presumed to execute in the same Pulumi org as `domain-account`.
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

1. Optionally, you can verify the configuration of your subdomain by deploying a simple S3 site:

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
