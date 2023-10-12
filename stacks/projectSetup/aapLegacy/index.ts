import { Config } from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"
import { Environments } from "../../../utility/Environments"

import { vpcName } from "./config"
import { vpcId } from "./config"
import { subnetFilter } from "./config"
import { routeTableFilter } from "./config"

type AwsAccount = "kinshipSharedServices" | "aapOmega"
const vpcStackName = new Config().get("vpcStackName")
const account = new Config().get("account") as AwsAccount
const environment = new Config().get("environment") as Environments
const projectPrefix = new Config().get("projectPrefix")
const securityGroupName = `${projectPrefix}-${environment}-${vpcName}-sg`
const peeringConnectionName = `VPC Peering between ${vpcStackName} and ${vpcName}`


type Configuration = {
    peerVpc: string
    vpcPeeringId: string
    nameTag: string
    vpcCidr: string
    peerConnectionAccepter: {
        allowRemoteVpcDnsResolution: boolean
      }
    }

const config: Configuration =
  account == "aapOmega"
    ? environment == "dev"
      ? {
          peerVpc: vpcId,
          vpcPeeringId: "pcx-082cad6937731645e",
          nameTag: peeringConnectionName,
          vpcCidr: "10.100.0.0/16",
          peerConnectionAccepter: {
            allowRemoteVpcDnsResolution: true
          },
        }
      : environment == 'staging'
      ? {
          peerVpc: vpcId,
          vpcPeeringId: "pcx-02d2c014dbcbe2ad6",
          nameTag: peeringConnectionName,
          vpcCidr: "10.110.0.0/16",
          peerConnectionAccepter: {
            allowRemoteVpcDnsResolution: true
          },
        }
      : environment == 'production'
      ? {
          peerVpc: vpcId,
          vpcPeeringId: "pcx-0ff320104aa6ca7d8",
          nameTag: peeringConnectionName,
          vpcCidr: "10.120.0.0/16",
          peerConnectionAccepter: {
            allowRemoteVpcDnsResolution: true
          },
        }
      : ({} as Configuration)
    : account == "kinshipSharedServices"
    ? environment == "dev"
      ? {
          peerVpc: vpcId,
          vpcPeeringId: "pcx-076b6b3141cbe1830",
          nameTag: peeringConnectionName,
          vpcCidr: "10.50.0.0/16",
          peerConnectionAccepter: {
            allowRemoteVpcDnsResolution: true
          },
        }
      : environment == 'staging'
      ? {
          peerVpc: vpcId,
          vpcPeeringId: "pcx-06cd1b93dde07ad6b",
          nameTag: peeringConnectionName,
          vpcCidr: "10.60.0.0/16",
          peerConnectionAccepter: {
            allowRemoteVpcDnsResolution: true
          },
        }
      : environment == 'production'
      ? {
          peerVpc: vpcId,
          vpcPeeringId: "pcx-06dac6dbc26779599",
          nameTag: peeringConnectionName,
          vpcCidr: "10.40.0.0/16",
          peerConnectionAccepter: {
            allowRemoteVpcDnsResolution: true
          },
        }
      : ({} as Configuration)
    : ({} as Configuration)


// Accepter's side of the peer connection
const vpcPeeringConnectionAccepter = new aws.ec2.VpcPeeringConnectionAccepter(`${projectPrefix}-${environment}-peer-to-${vpcName}`, {
    vpcPeeringConnectionId: config.vpcPeeringId,
    autoAccept: true,
    accepter: {
        allowRemoteVpcDnsResolution: config.peerConnectionAccepter.allowRemoteVpcDnsResolution,
    },
    tags: {
        Name: config.nameTag,
        Managed_by: "Pulumi",
        Environment: environment,
    },
});

// Get SubnetsIds
export const vpc = aws.ec2.Vpc.get(vpcName, vpcId);
export const subnetIds = vpc.id.apply(
    vpcId => aws.ec2.getSubnetIds({
        vpcId: vpcId,
        filters: [{
            name: "tag:Name",
            values: [subnetFilter],
        }],
    })
);

// Get RoteTable Id
const routeTableId = aws.ec2.getRouteTable({
    filters: [{
        name: "tag:Name",
        values: [routeTableFilter],
    }],
});

// Add Route to existing route table
const peerRoutes = new aws.ec2.Route(`${projectPrefix}-${environment}-peer-to-${vpcName}-route`, {
              routeTableId: routeTableId.then(routeTableId => routeTableId.id),
              destinationCidrBlock: config!.vpcCidr,
              vpcPeeringConnectionId: config.vpcPeeringId,
              
});

// Security group for RDS
const securityGroup = new aws.ec2.SecurityGroup(securityGroupName, {
    name: securityGroupName,
    vpcId: vpcId,
    ingress: [{
        description: `Allow access to RDS From ${projectPrefix} Peering connection`,
        cidrBlocks: [config.vpcCidr],
        fromPort: 5432,
        toPort: 5432,
        protocol: "tcp",
    }],
    tags: {
        Name: securityGroupName,
        Managed_by: "Pulumi",
        Environment: environment,
        Type:  "Postgresql/Aurora",
    },
});

/* 
 * The current RDS cluster is not managed by IaC.
 * The new security group will be assigned manually.
*/
