import { Config, StackReference } from "@pulumi/pulumi"
import { iamRolesPartOfProject } from "../../../utility/iamRolesPartOfProject"
import { k8sRoleArnsFor } from "../../../utility/k8sRoleArnsFor"
import { Configuration, globalStackReference } from "./config"

export const goodFriendDevConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-goodfriend-dev")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("GOODFRIEND_NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "dev",
    eksClusterName: "goodfriend-dev",
    ingress: {
      public: {
        route53Subdomain: "dev",
        replicaCount: 1,
        ingressClass: "nginx",
        externalTrafficPolicy: "Local"
      },
      internal: {
        route53Subdomain: "dev-internal",
        replicaCount: 1,
        ingressClass: "nginx-internal",
      },
    },
    eksClusterVersion: "1.23",
    clusterAutoscalerVersion: "1.23.0",
    eksAssumeRoleArn: JSON.parse(new Config("aws").get("assumeRole")!).roleArn,
    ingressBaseDomainRoute53ZoneId: "Z09851702L11TVLR9JA1H", // manually created
    ec2SshKeyName: "20221114", // manually created
    eksAddons: {
      ebsCSIDriver: true
    },
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      roles: k8sRoleArnsFor({ account: "GoodFriend", env: "dev", clusterPermission: "clusterAdmin" }),
      users: [],
    },
    k8sViewOnlyArns: {
      roles: k8sRoleArnsFor({ account: "GoodFriend", env: "dev", clusterPermission: "viewOnly" }),
      users: [],
    },
    k8sNamespaces: [
      {
        name: "gf-web",
        adminArns: {
          users: ["arn:aws:iam::682251556248:user/service/gf-web-cicd"],
          roles: iamRolesPartOfProject("gf-web"),
        },
      },
      {
        name: "gf-provider-api",
        adminArns: {
          users: ["arn:aws:iam::682251556248:user/service/gf-provider-api-cicd"],
          roles: iamRolesPartOfProject("gf-provider-api"),
        },
      },
    ],
    nodeGroups: [
      {
        scalingConfig: {
          minSize: 1,
          desiredSize: 2,
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
