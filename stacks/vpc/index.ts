import { ssm } from "@pulumi/aws"
import { Route, VpcEndpoint, VpcPeeringConnection } from "@pulumi/aws/ec2"
import { Vpc } from "@pulumi/awsx/ec2"
import { Config, getStack, interpolate, mergeOptions } from "@pulumi/pulumi"
import { Environments } from "../../utility/Environments"
import { AwsAccount } from "../awsAccount/config"


type Configuration = {
  vpcNumZones: number
  vpcName: string
  cidrBlock: string
  cloudAmqpVpcPeering?: {
    vpcId: string
    accountId: string
    region: string
    vpcCidr: string // You can see this in AWS after the VPC peering connection is accepted. Not sure where to view this within CloudAMQP UI...
  }
  vpcPeering?: Array<{
    name: string
    vpcId: string
    accountId: string
    region: string
    vpcCidr: string
    requester?: {
      allowRemoteVpcDnsResolution: boolean
    }
  }>
}

const environment = new Config().get("environment") as Environments
const awsAccount = new Config().get("awsAccount") as AwsAccount | undefined
const projectPrefix = awsAccount?.match(/^[a-z]+/)

/**
 * Do not use CIDR blocks
 *   - 10.135.0.0/16 (SF LAN)
 *   - 10.64.0.0/13 (i.e. 10.68.0.0 - 10.71.255.255, Verizon VPN)
 * Additional CIDR block allocations can be found here:
 *   - https://whistle.atlassian.net/wiki/spaces/IT/pages/589839/Network+Info
 */
const config: Configuration =
  awsAccount == undefined
    ? environment == "dev"
      ? {
          vpcNumZones: 3,
          vpcName: "new-dev",
          cidrBlock: "10.10.0.0/16",
        }
      : environment == "staging"
      ? {
          vpcNumZones: 3,
          vpcName: "new-staging",
          cidrBlock: "10.20.0.0/16",
          cloudAmqpVpcPeering: {
            vpcId: "vpc-41374f3a",
            accountId: "714915985929",
            region: "us-east-1",
            vpcCidr: "172.30.0.0/24",
          },
        }
      : environment == "production"
      ? {
          vpcNumZones: 3,
          vpcName: "new-production",
          cidrBlock: "10.30.0.0/16",
          cloudAmqpVpcPeering: {
            vpcId: "vpc-132b0168",
            accountId: "714915985929",
            region: "us-east-1",
            vpcCidr: "172.30.32.0/24",
          },
        }
      : ({} as Configuration)
    : awsAccount == "kinshipSharedServices"
    ? environment == "dev"
      ? {
          vpcNumZones: 3,
          vpcName: "dev",
          cidrBlock: "10.50.0.0/16",
          vpcPeering: [
            {
            name: `VPC Peering between kinship-shared-services-${environment} and aapLegacy`,
            vpcId: "vpc-867ea8e3",
            accountId: "069716362557",
            region: "us-east-1",
            vpcCidr: "10.10.0.0/16",
            requester: {
              allowRemoteVpcDnsResolution: true,
            },
          },
        ],
        }
      : environment == "staging"
      ? {
          vpcNumZones: 3,
          vpcName: "staging",
          cidrBlock: "10.60.0.0/16",
          vpcPeering: [
            {
            name: `VPC Peering between kinship-shared-services-${environment} and aapLegacy`,
            vpcId: "vpc-867ea8e3",
            accountId: "069716362557",
            region: "us-east-1",
            vpcCidr: "10.10.0.0/16",
            requester: {
              allowRemoteVpcDnsResolution: true,
            },
          },
            {
              name: `VPC Peering - KSS-${environment}/KDP-${environment}`,
              vpcId: "vpc-0ab4a88f04700812a",
              accountId: "497842599452",
              vpcCidr: "10.85.0.0/16",
              region: "us-east-1",
              requester: {
                allowRemoteVpcDnsResolution: true,
              },
            },
        ],
        }
      : environment == "production"
      ? {
          vpcNumZones: 3,
          vpcName: "production",
          cidrBlock: "10.40.0.0/16",
          vpcPeering: [
            {
            name: `VPC Peering between kinship-shared-services-${environment} and aapLegacy`,
            vpcId: "vpc-867ea8e3",
            accountId: "069716362557",
            region: "us-east-1",
            vpcCidr: "10.10.0.0/16",
            requester: {
              allowRemoteVpcDnsResolution: true,
            },
          },
          {
            name: `VPC Peering - KSS-${environment}/KDP-${environment}`,
            vpcCidr: "10.90.0.0/16",
            vpcId: "vpc-020dc233d7ffb4c4d",
            accountId: "497842599452",
            region: "us-east-1",
            requester: {
              allowRemoteVpcDnsResolution: true,
            }
          }
        ],
        }
      : ({} as Configuration)
      : awsAccount == "kinshipDataPlatform"
      ? environment == "staging"
        ? {
            vpcNumZones: 3,
            vpcName: "test",
            cidrBlock: "10.85.0.0/16",
          }
        : environment == "dev"
        ? {
            vpcNumZones: 3,
            vpcName: "dev",
            cidrBlock: "10.81.0.0/16", // 10.80 was taken by the VPC module we need to dispose of
          }
        : environment == "production"
        ? {
            vpcNumZones: 3,
            vpcName: "production",
            cidrBlock: "10.90.0.0/16",
          }
        : environment == "preprod"
        ? {
            vpcNumZones: 3,
            vpcName: "preprod",
            cidrBlock: "10.95.0.0/16",
          }
        : ({} as Configuration)
    : awsAccount == "aapOmega"
    ? environment == "production"
      ? {
          vpcNumZones: 3,
          vpcName: "production",
          cidrBlock: "10.120.0.0/16",
          vpcPeering: [{
            name: `VPC Peering between aap-omega-${environment} and aapLegacy`,
            vpcId: "vpc-867ea8e3",
            accountId: "069716362557",
            region: "us-east-1",
            vpcCidr: "10.10.0.0/16",
            requester: {
              allowRemoteVpcDnsResolution: true,
            },
          }],
        }
      : environment == "staging"
      ? {
          vpcNumZones: 3,
          vpcName: "staging",
          cidrBlock: "10.110.0.0/16",
          vpcPeering: [{
            name: `VPC Peering between aap-omega-${environment} and aapLegacy`,
            vpcId: "vpc-867ea8e3",
            accountId: "069716362557",
            region: "us-east-1",
            vpcCidr: "10.10.0.0/16",
            requester: {
              allowRemoteVpcDnsResolution: true,
            },
          }],
        }
      : environment == "dev"
      ? {
          vpcNumZones: 3,
          vpcName: "dev",
          cidrBlock: "10.100.0.0/16",
          vpcPeering: [{
            name: `VPC Peering between aap-omega-${environment} and aapLegacy`,
            vpcId: "vpc-867ea8e3",
            accountId: "069716362557",
            region: "us-east-1",
            vpcCidr: "10.10.0.0/16",
            requester: {
              allowRemoteVpcDnsResolution: true,
            },
          }],
        }
      : ({} as Configuration)
      : awsAccount == "vetInsight"
      ? environment == "production"
        ? {
            vpcNumZones: 3,
            vpcName: "production",
            cidrBlock: "10.134.0.0/16",
          }
        : environment == "staging"
        ? {
            vpcNumZones: 3,
            vpcName: "staging",
            cidrBlock: "10.131.0.0/16",
          }
        : environment == "dev"
        ? {
            vpcNumZones: 3,
            vpcName: "dev",
            cidrBlock: "10.130.0.0/16",
          }
        : ({} as Configuration)
      : awsAccount == "wisdomPanel"
      ? environment == "production"
        ? {
            vpcNumZones: 3,
            vpcName: "production",
            cidrBlock: "10.142.0.0/16",
          }
        : environment == "staging"
        ? {
            vpcNumZones: 3,
            vpcName: "staging",
            cidrBlock: "10.141.0.0/16",
          }
        : environment == "dev"
        ? {
            vpcNumZones: 3,
            vpcName: "dev",
            cidrBlock: "10.140.0.0/16",
          }
        : ({} as Configuration)
      : awsAccount == "GoodFriend"
      ? environment == "production"
        ? {
            vpcNumZones: 3,
            vpcName: "production",
            cidrBlock: "10.147.0.0/16",
          }
        : environment == "staging"
        ? {
            vpcNumZones: 3,
            vpcName: "staging",
            cidrBlock: "10.146.0.0/16",
          }
        : environment == "dev"
        ? {
            vpcNumZones: 3,
            vpcName: "dev",
            cidrBlock: "10.145.0.0/16",
          }
        : ({} as Configuration)
        : awsAccount == "PetExec"
        ? environment == "production"
          ? {
              vpcNumZones: 3,
              vpcName: "production",
              cidrBlock: "10.152.0.0/16",
            }
          : environment == "staging"
          ? {
              vpcNumZones: 3,
              vpcName: "staging",
              cidrBlock: "10.151.0.0/16",
            }
          : environment == "dev"
          ? {
              vpcNumZones: 3,
              vpcName: "dev",
              cidrBlock: "10.150.0.0/16",
            }
          : ({} as Configuration)
    : ({} as Configuration)

const vpc = new Vpc(
  config.vpcName,
  {
    numberOfAvailabilityZones: config.vpcNumZones,
    cidrBlock: config.cidrBlock,
    tags: {
      Name: config.vpcName,
      managed_by: "Pulumi",
    },
  },
  {
    transformations: [
      (args) =>
        args.type === "aws:ec2/subnet:Subnet"
          ? {
              props: args.props,
              opts: mergeOptions(args.opts, { ignoreChanges: ["tags"] }),
            }
          : undefined,
    ],
  }
)

const allRouteTableIds = Promise.all([vpc.privateSubnets, vpc.publicSubnets]).then(([x, y]) =>
  [...x, ...y].filter((x) => x.routeTable).map((x) => x.routeTable!.id)
)

const s3VpcEndpoint = new VpcEndpoint("s3VpcEndpoint", {
  vpcId: vpc.id,
  routeTableIds: allRouteTableIds,
  serviceName: "com.amazonaws.us-east-1.s3",
})

const dynamodbVpcEndpoint = new VpcEndpoint("dynamodbVpcEndpoint", {
  vpcId: vpc.id,
  routeTableIds: allRouteTableIds,
  serviceName: "com.amazonaws.us-east-1.dynamodb",
})

const cloudAmqpVpcPeering = config.cloudAmqpVpcPeering
  ? new VpcPeeringConnection("cloudAmqpVpcPeering", {
      peerVpcId: config.cloudAmqpVpcPeering.vpcId,
      peerOwnerId: config.cloudAmqpVpcPeering.accountId,
      peerRegion: config.cloudAmqpVpcPeering.region,
      vpcId: vpc.id,
    })
  : undefined

const cloudAmqpRoutes = cloudAmqpVpcPeering
  ? allRouteTableIds.then((ids) =>
      ids.map((id) =>
        id.apply(
          (id) =>
            new Route(`cloudAmqpRoute-${id}`, {
              routeTableId: id,
              vpcPeeringConnectionId: cloudAmqpVpcPeering.id,
              destinationCidrBlock: config.cloudAmqpVpcPeering!.vpcCidr,
            })
        )
      )
    )
  : undefined


  const vpcPeerings = config.vpcPeering?.length
  ? config.vpcPeering.map((peering, index) => {
    const vpcPeering = new VpcPeeringConnection(`${projectPrefix}VpcPeering-${index}`, {
      peerVpcId: peering.vpcId,
      peerOwnerId: peering.accountId,
      peerRegion: peering.region,
      vpcId: vpc.id,
      requester: {
        allowRemoteVpcDnsResolution: peering.requester?.allowRemoteVpcDnsResolution,
      },
      tags: {
        Environment: environment,
        Name: peering.name,
        Managed_by: "Pulumi"
      },
    })

    allRouteTableIds.then((ids) =>
      ids.map((id) =>
        id.apply(
          (id) =>
            new Route(`${projectPrefix}Route-${id}-${index}`, {
              routeTableId: id,
              vpcPeeringConnectionId: vpcPeering.id,
              destinationCidrBlock: peering.vpcCidr,
            })
        )
      )
    )
    return vpcPeering
  })
  : undefined

// Outputs
export const privateSubnetIds = vpc.privateSubnetIds
export const publicSubnetIds = vpc.publicSubnetIds
export const rtIds    = allRouteTableIds
export const vpcId = vpc.id
export const peerConnections = vpcPeerings

// AWS SSM outputs for universal accessibility
;[
  {
    name: "privateSubnetIds",
    value: privateSubnetIds.then((v) => v.reduce((p, c) => interpolate`${p},${c}`)),
    type: "StringList",
  },
  {
    name: "rtIds",
    value: rtIds.then((v) => v.reduce((p, c) => interpolate`${p},${c}`)),
    type: "StringList",
  },
  { name: "vpcCidrBlock", value: vpc.vpc.cidrBlock, type: "String" },
  { name: "vpcId", value: vpc.vpc.id, type: "String" },
].map(
  async ({ name, value, type }) =>
    new ssm.Parameter(name, {
      name: `/pulumi/${getStack()}/${name}`,
      type: type,
      value: await value,
    })
)

;[
  {
    name: "publicSubnetIds",
    value: publicSubnetIds.then((v) => v.reduce((p, c) => interpolate`${p},${c}`)),
    type: "StringList",
  },
  // { name: "vpcCidrBlock", value: vpc.vpc.cidrBlock, type: "String" },
  // { name: "vpcId", value: vpc.vpc.id, type: "String" },
].map(
  async ({ name, value, type }) =>
    new ssm.Parameter(name, {
      name: `/pulumi/${getStack()}/${name}`,
      type: type,
      value: await value,
    })
)
