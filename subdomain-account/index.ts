import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
export const subdomainFqdn = config.require("subdomainFqdn");

const subdomain = new aws.route53.Zone("subdomain", {
  name: subdomainFqdn,
  forceDestroy: true,
});

export const nameServers = subdomain.nameServers;