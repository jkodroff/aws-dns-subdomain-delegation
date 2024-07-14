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


const assumeRolePolicy = {
  Version: "2012-10-17",
  Statement: trustedAccountIds.map(accountId => ({
    Effect: "Allow",
    Principal: {
      AWS: `arn:aws:iam::${accountId}:root`,
    },
    Action: "sts:AssumeRole",
    Condition: {
      ArnLike: {
        "aws:PrincipalArn": [
          `arn:aws:iam::${accountId}:role/aws-reserved/sso.amazonaws.com/*/AWSReservedSSO_AdministratorAccess_*`,
          `arn:aws:iam::${accountId}:role/aws-reserved/sso.amazonaws.com/AWSReservedSSO_AdministratorAccess_*`
        ]
      }
    }
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
        "route53:GetHostedZone",
        "route53:ChangeResourceRecordSets",
        "route53:GetChange",
        "route53:ListResourceRecordSets",
      ],
      Resource: `arn:aws:route53:::hostedzone/${hostedZoneId}`,
    },
    // It may be possible to make this permission less broad. This appears to be
    // necessary so that the AWS provider only returns after the records have
    // actually been created:
    {
      Effect: "Allow",
      Action: [
        "route53:GetChange",
      ],
      Resource: `*`,
    },
  ],
};

new aws.iam.RolePolicy("delegationRolePolicy", {
  role: role.id,
  policy: JSON.stringify(policyDocument),
});

export const roleArn = role.arn;
