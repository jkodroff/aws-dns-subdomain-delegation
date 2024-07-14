# aws-dns-subdomain-delegation

Proof of concept using Pulumi for delegating subdomains for a hosted zone in Route 53:

- `domain-account` contains the code for the AWS account that owns the top-level Route 53 Hosted Zone.
- `subdomain-account` contains the code to be run in AWS accounts that wish to have a delegated subdomain.
- `subdomain-account-workload` contains a simple S3 static site configured to be at the `www.` sub-subdomain of the delegated subdomain.
