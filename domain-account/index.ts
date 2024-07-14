import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
export const hostedZoneId = config.require("hostedZoneId");

// Verify that the hosted zone actually exists:
aws.route53.Zone.get("existing-hosted-zone", hostedZoneId);

// Define the AWS account IDs that will assume the role
const trustedAccountIds = [
  "616138583583", // pulumi-dev-sandbox
];

// Create the IAM Role with the trust policy
const assumeRolePolicy = {
  Version: "2012-10-17",
  Statement: trustedAccountIds.map(accountId => ({
    Effect: "Allow",
    Principal: {
      AWS: `arn:aws:iam::${accountId}:root`,
    },
    Action: "sts:AssumeRole",
  })),
};

const role = new aws.iam.Role("delegation-role", {
  assumeRolePolicy: JSON.stringify(assumeRolePolicy),
});

const policyDocument = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Action: [
        "route53:ChangeResourceRecordSets",
        "route53:GetChange",
        "route53:ListResourceRecordSets",
      ],
      Resource: `arn:aws:route53:::hostedzone/${hostedZoneId}`,
    },
  ],
};

new aws.iam.RolePolicy("delegationRolePolicy", {
  role: role.id,
  policy: JSON.stringify(policyDocument),
});

// Export the role ARN
export const roleArn = role.arn;
