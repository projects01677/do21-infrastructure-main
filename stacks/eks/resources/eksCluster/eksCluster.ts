import { Cluster } from "@pulumi/eks"
import { uniq } from "lodash"
import { usernameFromIamArn } from "../../../../utility/usernameFromIamArn"
import { config } from "../../config/config"
import { viewOnlyName } from "../accessManagement/viewOnlyName"
import { eksInfrastructureLogGroup } from "./monitoring/cloudwatch"

export const eksCluster = new Cluster(config.envName, {
  name: config.eksClusterName,
  vpcId: config.vpcId,
  version: config.eksClusterVersion,
  publicSubnetIds: config.publicSubnetIds,
  privateSubnetIds: config.privateSubnetIds,
  endpointPrivateAccess: true,
  endpointPublicAccess: true,
  enabledClusterLogTypes: [
    "controllerManager",
    "scheduler",
  ],
  nodeGroupOptions: {
    desiredCapacity: 0,
    minSize: 0,
    maxSize: 0,
  },
  providerCredentialOpts:
    config.eksAssumeRoleArn == undefined
      ? undefined
      : {
        roleArn: config.eksAssumeRoleArn,
      },
  roleMappings: [
    ...config.k8sClusterAdminArns.roles.map((arn) => ({
      roleArn: arn,
      username: usernameFromIamArn(arn),
      groups: ["system:masters"],
    })),
    ...config.k8sViewOnlyArns.roles.map((arn) => ({
      roleArn: arn,
      username: usernameFromIamArn(arn),
      groups: [viewOnlyName],
    })),
    ...uniq(
      config.k8sNamespaces
        .flatMap((x) => x.adminArns.roles)
        .filter((arn) => [...config.k8sClusterAdminArns.roles, ...config.k8sViewOnlyArns.roles].indexOf(arn) == -1)
    ).map((arn) => ({
      roleArn: arn,
      username: usernameFromIamArn(arn),
      groups: [],
    })),
    ...uniq(
      config.k8sResourceRoleBindings
        ?.flatMap((x) => x.roles)
        .filter((arn) => [...config.k8sClusterAdminArns.roles, ...config.k8sViewOnlyArns.roles].indexOf(arn) == -1)
    ).map((arn) => ({
      roleArn: arn,
      username: usernameFromIamArn(arn),
      groups: [],
    })),
  ],
  userMappings: [
    ...config.k8sClusterAdminArns.users.map((arn) => ({
      userArn: arn,
      username: usernameFromIamArn(arn),
      groups: ["system:masters"],
    })),
    ...config.k8sViewOnlyArns.users.map((arn) => ({
      userArn: arn,
      username: usernameFromIamArn(arn),
      groups: [viewOnlyName],
    })),
    ...uniq(
      config.k8sNamespaces
        .flatMap((x) => x.adminArns.users)
        .filter((arn) => [...config.k8sClusterAdminArns.users, ...config.k8sViewOnlyArns.users].indexOf(arn) == -1)
    ).map((arn) => ({
      userArn: arn,
      username: usernameFromIamArn(arn),
      groups: [],
    })),
  ],
  tags: {
    managed_by: "Pulumi",
  },
}, {
  dependsOn: [eksInfrastructureLogGroup],
})
