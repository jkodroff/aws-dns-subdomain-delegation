import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
export const hostedZoneName = config.require("hostedZoneName");

// Verify that the hosted zone actually exists:
const zone = aws.route53.getZoneOutput({
  name: hostedZoneName,
});

interface TrustedAccountIds {
  data: string[];
}

const trustedAccountIds = config.requireObject<TrustedAccountIds>("trustedAccountIds");

const assumeRolePolicy = {
  Version: "2012-10-17",
  Statement: trustedAccountIds?.data.map(accountId => ({
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
  name: "zero-to-hero-subdomain",
  assumeRolePolicy: JSON.stringify(assumeRolePolicy),
});

const policyDocument = zone.zoneId.apply(zoneId => {
  const policy = {
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
        Resource: `arn:aws:route53:::hostedzone/${zoneId}`,
      },
      // It may be possible to make this permission less broad. This appears to be
      // necessary so that the AWS provider only returns after the records have
      // actually been created:
      {
        Effect: "Allow",
        Action: [
          "route53:GetChange",
          "route53:ListHostedZones",
          "route53:ListTagsForResource",
        ],
        Resource: `*`,
      },
    ],
  };
  return JSON.stringify(policy);
});

new aws.iam.RolePolicy("delegation-role-policy", {
  role: role.id,
  policy: policyDocument,
});

export const roleArn = role.arn;
