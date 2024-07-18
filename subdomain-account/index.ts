import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
export const subdomainFqdn = config.require("subdomainFqdn");
export const parentZoneRoleArn = config.require("parentZoneRoleArn");

const subdomain = new aws.route53.Zone("subdomain", {
  name: subdomainFqdn,
  forceDestroy: true,
});

const parentZoneProvider = new aws.Provider("parent-zone-account", {
  // This part is a little tricky: We need to make sure we are assuming the
  // target role from the correct source profile, which is the profile we are
  // using in the default provider.
  profile: aws.config.profile,
  assumeRole: {
    roleArn: parentZoneRoleArn
  }
});

const subdomainParts = subdomainFqdn.split(".");
export const parentDomain = subdomainParts.slice(1, subdomainParts.length).join(".");

const parentZone = aws.route53.getZoneOutput({
  name: parentDomain
}, { provider: parentZoneProvider });

new aws.route53.Record("subdomain-ns-records", {
  zoneId: parentZone.zoneId,
  name: subdomainFqdn,
  type: "NS",
  ttl: 300,
  records: subdomain.nameServers,
}, { provider: parentZoneProvider });

export const nameServers = subdomain.nameServers;