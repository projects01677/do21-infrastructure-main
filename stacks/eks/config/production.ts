import { StackReference } from "@pulumi/pulumi"
import { iamUsersPartOfProject } from "../../../utility/iamUsersPartOfProject"
import { k8sUserArnsFor } from "../../../utility/k8sUsersFor"
import { userConfig } from "../../userConfig"
import { Configuration, globalStackReference } from "./config"

export const productionConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-production")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "production",
    eksClusterName: "production",
    ingress: {
      public: {
        route53Subdomain: "production",
        replicaCount: 3,
        ingressClass: "nginx",
      },
      internal: {
        route53Subdomain: "production-internal",
        replicaCount: 3,
        ingressClass: "nginx-internal",
      },
    },
    eksClusterVersion: "1.24",
    clusterAutoscalerVersion: "1.24.3",
    eksAddons: {
      ebsCSIDriver: true
    },
    ingressBaseDomainRoute53ZoneId: "Z1N353BFWRBVRQ",
    ec2SshKeyName: "20210101",
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      users: k8sUserArnsFor({ account: "whistleSoftware", env: "production", clusterPermission: "clusterAdmin" }),
      roles: [],
    },
    k8sViewOnlyArns: {
      users: [
        "arn:aws:iam::419697633145:user/service/backstage-service-staging", // yes, staging is intentional here
        ...k8sUserArnsFor({ account: "whistleSoftware", env: "production", clusterPermission: "viewOnly" }),
      ],
      roles: [],
    },
    k8sNamespaces: [
      {
        name: "lola",
        adminArns: {
          users: [
            "arn:aws:iam::419697633145:user/service/lola-cicd", // todo: find a nice way to use globalStackReference.getOutput("lolaCicdIamArn") instead
            ...iamUsersPartOfProject("lola"),
          ],
          roles: [],
        },
      },
      {
        name: "logfiles",
        adminArns: {
          users: ["arn:aws:iam::419697633145:user/service/logfiles-cicd", ...iamUsersPartOfProject("logfiles")],
          roles: [],
        },
      },
      {
        name: "sdp",
        adminArns: {
          users: [
            "arn:aws:iam::419697633145:user/service/server-data-processor-cicd",
            ...iamUsersPartOfProject("server-data-processor"),
          ],
          roles: [],
        },
      },
    ],
    nodeGroups: [
      {
        scalingConfig: {
          minSize: 120,
          desiredSize: 120,
          maxSize: 125,
        },
        diskSizeGb: 30,
        name: "t3-small-on-demand-private",
        labels: {
          private: "true",
        },
        capacityType: "ON_DEMAND",
        instanceTypes: ["t3.small"],
        subnetIds: privateSubnetIds,
      },
      {
        scalingConfig: {
          minSize: 1,
          desiredSize: 1,
          maxSize: 10,
        },
        diskSizeGb: 100,
        name: "t3-medium-spott",
        capacityType: "SPOT",
        instanceTypes: ["t3.medium"],
        subnetIds: privateSubnetIds,
      },
    ],
  }
}
