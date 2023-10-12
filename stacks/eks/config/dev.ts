import { StackReference } from "@pulumi/pulumi"
import { k8sUserArnsFor } from "../../../utility/k8sUsersFor"
import { Configuration, globalStackReference } from "./config"

export const devConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-dev")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "dev",
    eksClusterName: "dev",
    ingress: {
      public: {
        route53Subdomain: "dev",
        replicaCount: 1,
        ingressClass: "nginx",
      },
      internal: {
        route53Subdomain: "dev-internal",
        replicaCount: 1,
        ingressClass: "nginx-internal",
      },
    },
    eksClusterVersion: "1.27",
    clusterAutoscalerVersion: "1.27.3",
    ingressBaseDomainRoute53ZoneId: "Z1N353BFWRBVRQ",
    ec2SshKeyName: "20210101",
    eksAddons: {
      ebsCSIDriver: true
    },
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      users: k8sUserArnsFor({ account: "whistleSoftware", env: "dev", clusterPermission: "clusterAdmin" }),
      roles: [],
    },
    k8sViewOnlyArns: {
      users: k8sUserArnsFor({ account: "whistleSoftware", env: "dev", clusterPermission: "viewOnly" }),
      roles: [],
    },
    k8sNamespaces: [],
    nodeGroups: [
      {
        scalingConfig: {
          minSize: 3,
          desiredSize: 3,
          maxSize: 6,
        },
        diskSizeGb: 100,
        name: "t3-medium-spot",
        capacityType: "SPOT",
        instanceTypes: ["t3.medium"],
        subnetIds: privateSubnetIds,
      },
    ],
  }
}
