import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const subdomainFqdn = config.require("subdomainFqdn");

const stackRef = new pulumi.StackReference("domain-account", {
  name: `${pulumi.getOrganization()}/domain-account/dev`
});

const parentHostedZoneId = stackRef.getOutput("hostedZoneId");
const roleArn = stackRef.getOutput("roleArn");

const myCurrentRole = aws.getCallerIdentityOutput();

const assumeRolePolicy = new aws.iam.Policy("assumeRolePolicy", {
  policy: pulumi.jsonStringify({
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Action: "sts:AssumeRole",
      Resource: roleArn,
    }],
  }),
});

const myRoleName = myCurrentRole.arn.apply(arn => {
  const arnParts = arn.split(":");
  const resourcePart = arnParts[arnParts.length - 1].replace("assumed-role/", "");
  const resourceParts = resourcePart.split("/");
  const roleName = resourceParts[0];

  console.log(roleName);
  return roleName;
});

const assumeRoleAttachment = new aws.iam.RolePolicyAttachment("assume-role", {
  role: myRoleName,
  policyArn: assumeRolePolicy.arn
});

// const subdomain = new aws.route53.Zone("subdomain", {
//   name: subdomainFqdn,
// });

// const parentZoneProvider = new aws.Provider("parent-zone-account", {
//   assumeRole: {
//     roleArn: roleArn
//   }
// }, { dependsOn: [assumeRoleAttachment] });

// new aws.route53.Record("subdomain-ns-records", {
//   zoneId: parentHostedZoneId,
//   name: subdomainFqdn,
//   type: "NS",
//   ttl: 300,
//   records: subdomain.nameServers,
// }, { provider: parentZoneProvider });