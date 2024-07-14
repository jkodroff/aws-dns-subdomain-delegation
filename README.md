# aws-dns-subdomain-delegation

Demo using Pulumi for delegating subdomains for a hosted zone in Route 53:

- `domain-account` contains the code for the AWS account that owns the top-level Route 53 Hosted Zone, e.g. `example.com`:
  - The config value `hostedZoneId` must be set to the hosted zone ID for `example.com`.
- `subdomain-account` contains the code to be run in AWS accounts that wish to have a delegated subdomain, e.g. `foo.example.com`:
  - This stack is presumed to execute in the same Pulumi org as `domain-account`.
- `subdomain-account-workload` contains a simple S3 static site configured to be at the `www.` sub-subdomain of the delegated subdomain, e.g. `www.foo.example.com`:
  - This stack is presumed to execute in the same Pulumi order as `subdomain-account`.
