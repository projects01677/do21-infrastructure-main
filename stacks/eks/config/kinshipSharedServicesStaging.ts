import { Config, StackReference } from "@pulumi/pulumi"
import { iamRolesPartOfProject } from "../../../utility/iamRolesPartOfProject"
import { k8sRoleArnsFor } from "../../../utility/k8sRoleArnsFor"
import { Configuration, globalStackReference } from "./config"

export const kinshipSharedServicesStagingConfig = (): Configuration => {
  const vpcStackReference = new StackReference("vpc-kinship-shared-services-staging")
  const publicSubnetIds = vpcStackReference.getOutput("publicSubnetIds").apply((x) => x as Array<string>)
  const privateSubnetIds = vpcStackReference.getOutput("privateSubnetIds").apply((x) => x as Array<string>)
  return {
    NEW_RELIC_LICENSE_KEY: globalStackReference.getOutput("KINSHIP_NEW_RELIC_LICENSE_KEY").apply((x) => x as string),
    vpcId: vpcStackReference.getOutput("vpcId").apply((x) => x as string),
    publicSubnetIds,
    privateSubnetIds,
    envName: "staging",
    eksClusterName: "kinship-shared-services-staging",
    ingress: {
      public: {
        route53Subdomain: "staging",
        replicaCount: 1,
        ingressClass: "nginx",
      },
      internal: {
        route53Subdomain: "staging-internal",
        replicaCount: 1,
        ingressClass: "nginx-internal",
      },
    },
    eksClusterVersion: "1.23",
    clusterAutoscalerVersion: "1.23.0",
    eksAssumeRoleArn: JSON.parse(new Config("aws").get("assumeRole")!).roleArn,
    ingressBaseDomainRoute53ZoneId: "Z00062422F2G2P7JGNRGQ",
    ec2SshKeyName: "20210722",
    eksAddons: {
      ebsCSIDriver: true
    },
    maintenancePageReplicas: 1,
    k8sClusterAdminArns: {
      roles: k8sRoleArnsFor({ account: "kinshipSharedServices", env: "staging", clusterPermission: "clusterAdmin" }),
      users: [],
    },
    k8sViewOnlyArns: {
      roles: k8sRoleArnsFor({ account: "kinshipSharedServices", env: "staging", clusterPermission: "viewOnly" }),
      users: [],
    },
    k8sNamespaces: [
      {
        name: "userinfoproducer",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/userinfoproducer-cicd"],
          roles: iamRolesPartOfProject("userinfoproducer"),
        },
      },
      {
        name: "userinfoconsumer",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/userinfoconsumer-cicd"],
          roles: iamRolesPartOfProject("userinfoproducer"),
        },
      },
      {
        name: "mparticlejob",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/mparticlejob-cicd"],
          roles: iamRolesPartOfProject("mparticlejob"),
        },
      },
      {
        name: "singlesignon",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/singlesignon-cicd"],
          roles: iamRolesPartOfProject("singlesignon"),
        },
      },
      {
        name: "kong",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/kong-cicd"],
          roles: iamRolesPartOfProject("kong"),
        },
      },
      {
        name: "sac-apimetricsdata-api",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/sac-apimetricsdata-api-cicd"],
          roles: iamRolesPartOfProject("sac-apimetricsdata-api"),
        },
      },
      {
        name: "aap-npasignup-api",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/aap-npasignup-api-cicd"],
          roles: iamRolesPartOfProject("aap-npasignup-api"),
        },
      },
      {
        name: "aap-petlist-api",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/aap-petlist-api-cicd"],
          roles: iamRolesPartOfProject("aap-petlist-api"),
        },
      },
      {
        name: "aap-bulkexport-api",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/aap-bulkexport-api-cicd"],
          roles: iamRolesPartOfProject("aap-bulkexport-api"),
        },
      },
      {
        name: "aap-search-api",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/aap-search-api-cicd"],
          roles: iamRolesPartOfProject("aap-search-api"),
        },
      },
      {
        name:"ok-user-profile-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-user-profile-svc-cicd"],
          roles: iamRolesPartOfProject("ok-user-profile-svc")
        }
      },
      {
        name:"ok-pet-profile-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-pet-profile-svc-cicd"],
          roles: iamRolesPartOfProject("ok-pet-profile-svc")
        }
      },
      {
        name:"ok-subscription-core-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-subscription-core-svc-cicd"],
          roles: iamRolesPartOfProject("ok-subscription-core-svc")
        }
      },
      {
        name:"ok-health-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-health-svc-cicd"],
          roles: iamRolesPartOfProject("ok-health-svc")
        }
      },
      {
        name:"ki-identity-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ki-identity-svc-cicd"],
          roles: iamRolesPartOfProject("ki-identity-svc")
        }
      },
      {
        name:"ki-document-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ki-document-svc-cicd"],
          roles: iamRolesPartOfProject("ki-document-svc")
        }
      },
      {
        name:"ok-note-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-note-svc-cicd"],
          roles: iamRolesPartOfProject("ok-note-svc")
        }
      },
      {
        name:"ok-tag-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-tag-svc-cicd"],
          roles: iamRolesPartOfProject("ok-tag-svc")
        }
      },
      {
        name:"ok-okta-event-webhook-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-okta-event-webhook-svc-cicd"],
          roles: iamRolesPartOfProject("ok-okta-event-webhook-svc")
        }
      },
      {
        name: "the-kin-content-api",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/the-kin-content-api-cicd"],
          roles: iamRolesPartOfProject("the-kin-content-api"),
        },
      },
      {
        name:"ok-payment-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-payment-svc-cicd"],
          roles: iamRolesPartOfProject("ok-payment-svc")
        }
      },
      {
        name: "the-kin-vet-chat-summary",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/the-kin-vet-chat-summary-cicd"],
          roles: iamRolesPartOfProject("the-kin-vet-chat-summary"),
        },
      },
      {
        name:"ok-notification-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-notification-svc-cicd"],
          roles: iamRolesPartOfProject("ok-notification-svc")
        }
      },
      {
        name:"ok-back4app-svc",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/ok-back4app-svc-cicd"],
          roles: iamRolesPartOfProject("ok-back4app-svc")
        }
      },
      {
        name: "the-kin-api",
        adminArns: {
          users: ["arn:aws:iam::575036886166:user/service/the-kin-api-cicd"],
          roles: iamRolesPartOfProject("the-kin-api"),
        },
      },
    ],
    k8sResourceRoleBindings: [
      {
        name: "kong-ingress-controller",
        userArn: "arn:aws:iam::575036886166:user/service/kong-cicd",
        namespace: "kong",
        roles: iamRolesPartOfProject("kong"),
      },
    ],
    nodeGroups: [
      {
        scalingConfig: {
          minSize: 1,
          desiredSize: 4,
          maxSize: 10,
        },
        diskSizeGb: 100,
        name: "c5-2xlarge-spot",
        capacityType: "SPOT",
        instanceTypes: ["c5.2xlarge"],
        subnetIds: privateSubnetIds,
      },
      {
        scalingConfig: {
          minSize: 1,
          desiredSize: 5,
          maxSize: 20,
        },
        diskSizeGb: 100,
        name: "c5-xlarge-spot",
        capacityType: "SPOT",
        instanceTypes: ["c5.xlarge"],
        subnetIds: privateSubnetIds,
      },
    ],
    nginxIngress: {
      proxyBodySize: "30m",
    },
  }
}
