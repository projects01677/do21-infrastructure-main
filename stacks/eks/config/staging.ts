import * as pulumi from "@pulumi/pulumi"
import { StackReference } from "@pulumi/pulumi"
import { iamUsersPartOfProject } from "../../../utility/iamUsersPartOfProject"
import { k8sUserArnsFor } from "../../../utility/k8sUsersFor"
import { userConfig } from "../../userConfig"
import { Configuration, globalStackReference } from "./config"

export const stagingConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-staging")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "staging",
    eksClusterName: "staging",
    ingress: {
      public: {
        route53Subdomain: "staging",
        replicaCount: 2,
        ingressClass: "nginx",
      },
      internal: {
        route53Subdomain: "staging-internal",
        replicaCount: 2,
        ingressClass: "nginx-internal",
      },
    },
    eksClusterVersion: "1.27",
    clusterAutoscalerVersion: "1.27.3",
    eksAddons: {
      ebsCSIDriver: true
    },
    ingressBaseDomainRoute53ZoneId: "Z1N353BFWRBVRQ",
    ec2SshKeyName: "20210101",
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      users: k8sUserArnsFor({ account: "whistleSoftware", env: "staging", clusterPermission: "clusterAdmin" }),
      roles: [],
    },
    k8sViewOnlyArns: {
      users: [
        "arn:aws:iam::419697633145:user/service/backstage-service-staging",
        ...k8sUserArnsFor({ account: "whistleSoftware", env: "staging", clusterPermission: "viewOnly" }),
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
          minSize: 1,
          desiredSize: 1,
          maxSize: 6,
        },
        diskSizeGb: 100,
        name: "t3-medium-on-demand",
        capacityType: "ON_DEMAND",
        instanceTypes: ["t3.medium"],
        subnetIds: pulumi.all([publicSubnetIds, privateSubnetIds]).apply(([pub, priv]) => [...pub, ...priv]),
      },
      {
        scalingConfig: {
          minSize: 3,
          desiredSize: 3,
          maxSize: 6,
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
