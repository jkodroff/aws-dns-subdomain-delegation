import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const stackRef = new pulumi.StackReference("domain-account", {
  name: `${pulumi.getOrganization()}/domain-account/dev`
});

const subdomainFqdn = stackRef.getOutput("subdomainFqdn") as pulumi.Output<string>;
const websiteDomain = pulumi.interpolate`www.${subdomainFqdn}`;

const bucket = new aws.s3.Bucket("public-website", {
  bucket: websiteDomain,
  website: {
    indexDocument: "index.html"
  }
});

new aws.s3.BucketObject("index.html", {
  bucket: bucket,
  source: new pulumi.asset.FileAsset("www/index.html"),
  contentType: "text/html",
});

const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
  bucket: bucket.bucket,
  blockPublicPolicy: false,
});

const bucketPolicy = bucket.arn.apply(arn => {
  const policyObj = {
    Version: "2012-10-17",
    Statement: [{
      Effect: "Allow",
      Principal: "*",
      Action: ["s3:GetObject"],
      Resource: [`${arn}/*`],
    }]
  };

  return JSON.stringify(policyObj);
});

new aws.s3.BucketPolicy("bucket-policy", {
  bucket: bucket.bucket,
  policy: bucketPolicy,
}, {
  dependsOn: [publicAccessBlock],
});

const hostedZone = aws.route53.getZoneOutput({
  name: subdomainFqdn,
});

new aws.route53.Record("bucket-dns", {
  zoneId: hostedZone.zoneId,
  name: websiteDomain,
  type: "NS",
});

export const url = pulumi.interpolate`http://${websiteDomain}`;