import { ssm } from "@pulumi/aws"
import { getStack } from "@pulumi/pulumi"
import { eksClusterRoleBindings } from "./resources/accessManagement/k8sClusterRoleBindings"
import { eksClusterAutoscaler } from "./resources/eksCluster/clusterAutoscaler/eksClusterAutoscaler"
import { eksCluster } from "./resources/eksCluster/eksCluster"
import { kongClusterRoleBindings } from "./resources/kong/kongK8sClusterRoleBindings"
import { eksNodeGroups } from "./resources/eksCluster/eksNodeGroups"
import { ingressNginxInternal } from "./resources/ingress/nginxInternal"
import { ingressNginxPublic } from "./resources/ingress/nginxPublic"
import { maintenancePageApp } from "./resources/maintenancePage/maintenancePage"
import { metricsServer } from "./resources/metricsServer"
import { newRelicMonitoring } from "./resources/newRelicMonitoring"
import { storageClassEbs } from "./resources/storageClassEbs"
import { iamRoleServiceAccount } from "./resources/serviceAccount/serviceAccountIamRoleAndPolicy"
import { eksEBSCSIDriver } from "./resources/eksCluster/csiDriver/awsEbsCSIDriver"

eksCluster
eksClusterRoleBindings
kongClusterRoleBindings.kongResourceClusterRoleBinding()
eksNodeGroups
ingressNginxPublic
ingressNginxInternal
storageClassEbs
metricsServer
eksClusterAutoscaler
maintenancePageApp
newRelicMonitoring
iamRoleServiceAccount.serviceAccountRolePolicyBinding()
eksEBSCSIDriver

// Outputs
export const maintenancePageEndpoint = maintenancePageApp.publicIngress.spec.rules[0].host
export const ingressDomainPublic = ingressNginxPublic.baseDomain
export const ingressNlbHostnamePublic = ingressNginxPublic.nlbHostname
export const ingressDomainInternal = ingressNginxInternal.baseDomain // WARNING: This domain is NOT RELIABLY reachable from within the cluster itself: https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-troubleshooting.html#loopback-timeout
export const ingressInternalHostedZoneId = ingressNginxInternal.internalZone.id
export const ingressPublicHostedZoneId = ingressNginxPublic.whistleRoute53Zone.id
export const eksClusterArn = eksCluster.eksCluster.arn
export const kubeConfig = eksCluster.kubeconfig
export const storageClassEbsName = storageClassEbs.metadata.name
export const eksClusterUrl = eksCluster.eksCluster.identities[0].oidcs[0].issuer
export const eksClusterSecurityGroupId = eksCluster.eksCluster.vpcConfig.clusterSecurityGroupId
export const oidcIssuerId = eksClusterUrl.apply(url => url.substr(url.lastIndexOf('/') + 1))

// AWS SSM outputs for universal accessibility
;[
  { name: "ingressDomainPublic", value: ingressDomainPublic },
  { name: "ingressNlbHostnamePublic", value: ingressNlbHostnamePublic },
  { name: "ingressDomainInternal", value: ingressDomainInternal },
  { name: "ingressInternalHostedZoneId", value: ingressInternalHostedZoneId },
  { name: "eksClusterArn", value: eksClusterArn },
  { name: "storageClassEbsName", value: storageClassEbsName },
  { name: "oidcIssuerId", value: oidcIssuerId },
  { name: "eksClusterSecurityGroupId", value: eksClusterSecurityGroupId},
].map(
  ({ name, value }) =>
    new ssm.Parameter(name, {
      name: `/pulumi/${getStack()}/${name}`,
      type: "String",
      value: value,
    })
)
