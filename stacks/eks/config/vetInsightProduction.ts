import { Config, StackReference } from "@pulumi/pulumi"
import { iamRolesPartOfProject } from "../../../utility/iamRolesPartOfProject"
import { k8sRoleArnsFor } from "../../../utility/k8sRoleArnsFor"
import { Configuration, globalStackReference } from "./config"

export const vetInsightProductionConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-vetinsight-production")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("VETINSIGHT_NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "production",
    eksClusterName: "vetinsight-production",
    ingress: {
      public: {
        route53Subdomain: "production",
        replicaCount: 1,
        ingressClass: "nginx",
        externalTrafficPolicy: "Local"
      },
      internal: {
        route53Subdomain: "production-internal",
        replicaCount: 1,
        ingressClass: "nginx-internal",
      },
    },
    eksClusterVersion: "1.23",
    clusterAutoscalerVersion: "1.23.0",
    eksAssumeRoleArn: JSON.parse(new Config("aws").get("assumeRole")!).roleArn,
    ingressBaseDomainRoute53ZoneId: "Z05759001EVC2AS8SWNAU", // manually created
    ec2SshKeyName: "20230424", // manually created
    eksAddons: {
      ebsCSIDriver: true
    },
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      roles: k8sRoleArnsFor({ account: "vetInsight", env: "production", clusterPermission: "clusterAdmin" }),
      users: [],
    },
    k8sViewOnlyArns: {
      roles: k8sRoleArnsFor({ account: "vetInsight", env: "production", clusterPermission: "viewOnly" }),
      users: [],
    },
    k8sNamespaces: [
        {
            name: "vetinsight",
            adminArns: {
              users: ["arn:aws:iam::672673849622:user/service/vetinsight-cicd"],
              roles: iamRolesPartOfProject("vetinsight"),
            },
          },
          {
            name: "web-widget",
            adminArns: {
              users: ["arn:aws:iam::672673849622:user/service/vetinsight-cicd"],
              roles: iamRolesPartOfProject("vetinsight"),
            },
          },
          {
            name: "custom-resources",
            adminArns: {
              users: ["arn:aws:iam::672673849622:user/service/vetinsight-cicd"],
              roles: iamRolesPartOfProject("vetinsight"),
            },
          },
          {
            name: "supporting-tools",
            adminArns: {
              users: ["arn:aws:iam::672673849622:user/service/vetinsight-cicd"],
              roles: iamRolesPartOfProject("vetinsight"),
            },
          },
    ],
    nodeGroups: [
      {
        scalingConfig: {
          minSize: 5,
          desiredSize: 5,
          maxSize: 10,
        },
        diskSizeGb: 100,
        name: "t3-medium-on-demand",
        capacityType: "ON_DEMAND",
        instanceTypes: ["t3.medium"],
        subnetIds: privateSubnetIds,
      },
    ],
  }
}
