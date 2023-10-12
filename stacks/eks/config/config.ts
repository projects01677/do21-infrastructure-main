import { Config, Output, StackReference } from "@pulumi/pulumi"
import { input as inputs } from "@pulumi/aws/types/index"
import { Environments } from "../../../utility/Environments"
import { Projects, lineOfBusiness } from "../../userConfig"
import { devConfig } from "./dev"
import { kinshipSharedServicesDevConfig } from "./kinshipSharedServicesDev"
import { kinshipSharedServicesStagingConfig } from "./kinshipSharedServicesStaging"
import { kinshipSharedServicesProductionConfig } from "./kinshipSharedServicesProduction"
import { productionConfig } from "./production"
import { stagingConfig } from "./staging"
import { aapOmegaDevConfig } from "./aapOmegaDev"
import { aapOmegaStagingConfig } from "./aapOmegaStaging"
import { aapOmegaProductionConfig } from "./aapOmegaProduction"
import { goodFriendDevConfig } from "./goodFriendDev"
import { vetInsightDevConfig } from "./vetInsightDev"
import { vetInsightStagingConfig } from "./vetInsightStaging"
import { vetInsightProductionConfig } from "./vetInsightProduction"

type IngressSpecs = {
  route53Subdomain: string
  replicaCount: number
  ingressClass: string
  externalTrafficPolicy?: string
}
export type k8sResourceRoleBinding = {
  name: string;
  userArn: string;
  namespace: string;
  roles: Array<string>
}
export type Configuration = {
  NEW_RELIC_LICENSE_KEY: Output<string>
  vpcId: Output<string>
  publicSubnetIds: Output<Array<string>>
  privateSubnetIds: Output<Array<string>>
  envName: Environments
  eksClusterName: string
  ingress: {
    public: IngressSpecs
    internal: IngressSpecs
  }
  eksClusterVersion: string
  clusterAutoscalerVersion: string
  eksAssumeRoleArn?: string
  ingressBaseDomainRoute53ZoneId: string
  ec2SshKeyName: string
  k8sClusterAdminArns: { users: Array<string>; roles: Array<string> }
  k8sViewOnlyArns: { users: Array<string>; roles: Array<string> }
  k8sNamespaces: Array<{
    name: string
    adminArns: { users: Array<string>; roles: Array<string> }
  }>
  iamRoleServiceAccount?: {
    serviceAccountName: string
    serviceAccountNamespace: string
  }
  eksAddons?: {
    ebsCSIDriver: boolean
  }
  k8sResourceRoleBindings?: Array<k8sResourceRoleBinding>
  maintenancePageReplicas: number
  nodeGroups: Array<{
    instanceTypes: Array<string>
    capacityType: "SPOT" | "ON_DEMAND"
    name: string
    subnetIds: Output<Array<string>>
    labels?: { [key: string]: string }
    taints?: Array<nodeGroupTaint>
    scalingConfig: {
      desiredSize: number
      maxSize: number
      minSize: number
    }
    diskSizeGb: number
  }>
  nginxIngress?: {
    proxyBodySize: string
  }
}

type nodeGroupTaintEffect = "NO_SCHEDULE" | "NO_EXECUTE" | "PREFER_NO_SCHEDULE"
type nodeGroupTaintKey = "dedicated" | "node-group-type"
type nodeGroupTaintValue = Projects | lineOfBusiness | "compute" | "memory" | "io"

interface nodeGroupTaint extends inputs.eks.NodeGroupTaint {
  effect: nodeGroupTaintEffect
  key: nodeGroupTaintKey
  value: nodeGroupTaintValue
}

const environment = new Config().get("environment")
const awsAccount = new Config().get("awsAccount")
export const globalStackReference = new StackReference("global")

export const config: Configuration =
  awsAccount == undefined
    ? environment == "dev"
      ? devConfig()
      : environment == "staging"
      ? stagingConfig()
      : environment == "production"
      ? productionConfig()
      : ({} as Configuration)
    : awsAccount == "kinshipSharedServices"
    ? environment == "dev"
      ? kinshipSharedServicesDevConfig()
      : environment == "staging"
      ? kinshipSharedServicesStagingConfig()
      : environment == "production"
      ? kinshipSharedServicesProductionConfig()
      : ({} as Configuration)
    : awsAccount == "aapOmega"
    ? environment == "dev"
      ? aapOmegaDevConfig()
      : environment == "staging"
      ? aapOmegaStagingConfig()
      : environment == "production"
      ? aapOmegaProductionConfig()
      : ({} as Configuration)
    : awsAccount == "GoodFriend"
    ? environment == "dev"
      ? goodFriendDevConfig()
      : ({} as Configuration)
    : awsAccount == "vetInsight"
    ? environment == "dev"
      ? vetInsightDevConfig()
      : environment == "staging"
      ? vetInsightStagingConfig()
      : environment == "production"
      ? vetInsightProductionConfig()
      : ({} as Configuration)
    : ({} as Configuration)
