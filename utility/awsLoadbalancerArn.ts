import { getRegion } from "@pulumi/aws"
import { interpolate, Output } from "@pulumi/pulumi"

export const awsLoadbalancerArn = ({ awsAccountId, lbHostname }: { awsAccountId: Promise<string>; lbHostname: Output<string> }) =>
  interpolate`arn:aws:elasticloadbalancing:${getRegion().then(
    (x) => x.name
  )}:${awsAccountId}:loadbalancer/net/${lbHostname.apply((x) => x.match(/(.*?)-(.*?)\.(.*)/)?.[1])}/${lbHostname.apply(
    (x) => x.match(/(.*?)-(.*?)\.(.*)/)?.[2]
  )}`
