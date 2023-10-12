import * as eks from "@pulumi/aws/eks"
import { Resource } from "@pulumi/pulumi"
import { config } from "../../config/config"
import { eksCluster } from "./eksCluster"

export const eksNodeGroups = config.nodeGroups.map(
  (nodeGroup) =>
    new eks.NodeGroup(
      nodeGroup.name,
      {
        clusterName: eksCluster.eksCluster.name,
        nodeRoleArn: eksCluster.instanceRoles[0].arn,
        subnetIds: nodeGroup.subnetIds,
        version: eksCluster.eksCluster.version,
        scalingConfig: nodeGroup.scalingConfig,
        remoteAccess: {
          ec2SshKey: config.ec2SshKeyName,
        },
        instanceTypes: nodeGroup.instanceTypes,
        labels: nodeGroup.labels,
        amiType: "AL2_x86_64",
        diskSize: nodeGroup.diskSizeGb,
        capacityType: nodeGroup.capacityType,
        nodeGroupName: nodeGroup.name,
        taints: nodeGroup.taints,
        tags: {
          managed_by: "Pulumi",
        },
      },
      {
        ignoreChanges: ["scalingConfig.desiredSize"],
        dependsOn: [eksCluster.core.eksNodeAccess as Resource]
      }
    )
)
