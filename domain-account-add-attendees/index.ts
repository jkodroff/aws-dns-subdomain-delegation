import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as yaml from "js-yaml";

interface ConfigData {
  fqdn: string;
  nsRecords: string[];
}

const fileContents = fs.readFileSync("./config.yaml", "utf-8");
const data = yaml.load(fileContents) as ConfigData[];

data.forEach(config => {
  const subdomainParts = config.fqdn.split(".");
  const parentDomain = subdomainParts.slice(1, subdomainParts.length).join(".");

  const parentZone = aws.route53.getZoneOutput({
    name: parentDomain
  });

  new aws.route53.Record(config.fqdn, {
    zoneId: parentZone.zoneId,
    name: config.fqdn,
    type: "NS",
    ttl: 300,
    records: config.nsRecords,
  });
})

