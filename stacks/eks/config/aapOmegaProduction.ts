import { Config, StackReference } from "@pulumi/pulumi"
import { iamRolesPartOfProject } from "../../../utility/iamRolesPartOfProject"
import { k8sRoleArnsFor } from "../../../utility/k8sRoleArnsFor"
import { Configuration, globalStackReference } from "./config"

export const aapOmegaProductionConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-aap-omega-production")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("AAP_NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "production",
    eksClusterName: "aap-omega-production",
    ingress: {
      public: {
        route53Subdomain: "production",
        replicaCount: 1,
        ingressClass: "nginx",
        externalTrafficPolicy: "Local",
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
    ingressBaseDomainRoute53ZoneId: "Z09432963ICQDKQ1WKEKA", //omega.appdev.org (Manually created)
    ec2SshKeyName: "20220126",
    eksAddons: {
      ebsCSIDriver: true
    },
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      roles: k8sRoleArnsFor({ account: "aapOmega", env: "production", clusterPermission: "clusterAdmin" }),
      users: [],
    },
    k8sViewOnlyArns: {
      roles: k8sRoleArnsFor({ account: "aapOmega", env: "production", clusterPermission: "viewOnly" }),
      users: [],
    },
    k8sNamespaces: [
      {
        name: "petsearch",
        adminArns: {
          users: ["arn:aws:iam::682251556248:user/service/petsearch-cicd"],
          roles: iamRolesPartOfProject("petsearch"),
        },
      },
      {
        name: "aap-rehome-svc",
        adminArns: {
          users: ["arn:aws:iam::682251556248:user/service/aap-rehome-svc-cicd"],
          roles: iamRolesPartOfProject("aap-rehome-svc"),
        },
      },
    ],
    iamRoleServiceAccount: {
      serviceAccountName: "petsearch-production",
      serviceAccountNamespace: "petsearch",
    },
    nodeGroups: [
      {
        scalingConfig: {
          minSize: 6,
          desiredSize: 7,
          maxSize: 18,
        },
        diskSizeGb: 100,
        name: "c5-xlarge-on-demand",
        capacityType: "ON_DEMAND",
        instanceTypes: ["c5.xlarge"],
        subnetIds: privateSubnetIds,
      },
      {
        labels: {
          dedicated: "aap-rehome-svc",
        },
        taints: [
          {
            effect: "NO_SCHEDULE",
            key: "dedicated",
            value: "aap-rehome-svc",
          },
        ],
        scalingConfig: {
          minSize: 3,
          desiredSize: 3,
          maxSize: 6,
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
