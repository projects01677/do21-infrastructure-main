import { Config, StackReference } from "@pulumi/pulumi"
import { iamRolesPartOfProject } from "../../../utility/iamRolesPartOfProject"
import { k8sRoleArnsFor } from "../../../utility/k8sRoleArnsFor"
import { Configuration, globalStackReference } from "./config"

export const vetInsightDevConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-vetinsight-dev")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("VETINSIGHT_NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "dev",
    eksClusterName: "vetinsight-dev",
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
    ingressBaseDomainRoute53ZoneId: "Z05759001EVC2AS8SWNAU", // manually created
    ec2SshKeyName: "20230424", // manually created
    eksAddons: {
      ebsCSIDriver: true
    },
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      roles: k8sRoleArnsFor({ account: "vetInsight", env: "dev", clusterPermission: "clusterAdmin" }),
      users: [],
    },
    k8sViewOnlyArns: {
      roles: k8sRoleArnsFor({ account: "vetInsight", env: "dev", clusterPermission: "viewOnly" }),
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
          minSize: 1,
          desiredSize: 4,
          maxSize: 8,
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
