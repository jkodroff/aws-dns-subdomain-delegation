import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
export const subdomainFqdn = config.require("subdomainFqdn");

const stackRef = new pulumi.StackReference("domain-account", {
  name: `${pulumi.getOrganization()}/domain-account/dev`
});

const parentHostedZoneId = stackRef.getOutput("hostedZoneId") as pulumi.Output<string>;
const roleArn = stackRef.getOutput("roleArn") as pulumi.Output<string>;

const myCurrentRole = aws.getCallerIdentityOutput();

const subdomain = new aws.route53.Zone("subdomain", {
  name: subdomainFqdn,
  tags: {
    owner: "josh@pulumi.com"
  }
});

const parentZoneProvider = new aws.Provider("parent-zone-account", {
  // This part is a little tricky: We need to make sure we are assuming the
  // target role from the correct source profile, which is the profile we are
  // using in the default provider.
  profile: aws.config.profile,
  assumeRole: {
    roleArn: roleArn
  }
});

new aws.route53.Record("subdomain-ns-records", {
  zoneId: parentHostedZoneId,
  name: subdomainFqdn,
  type: "NS",
  ttl: 300,
  records: subdomain.nameServers,
}, { provider: parentZoneProvider });