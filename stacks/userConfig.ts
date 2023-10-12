import { Environments } from "../utility/Environments"
import { AwsAccount } from "./awsAccount/config"
import { MembershipRoles, TeamNames } from "./kinshipGithub/src/config"
import { PartialRecord } from "../utility/PartialRecord"
import { PagerDutyUser, slackMonitoringPlatformProject } from "./monitoringConfig"

export type lineOfBusiness =
  | "aap"
  | "ki"
  | "ok"
  | "pe"
  | "sac"
  | "wp"
  | "gf"

export type Projects =
  | "logfiles"
  | "lola"
  | "server"
  | "airbuddies"
  | "server-data-processor"
  | "userinfoproducer"
  | "userinfoconsumer"
  | "mparticlejob"
  | "shelteranimalscount"
  | "singlesignon"
  | "kong"
  | "kinshipdataplatform"
  | "pearl"
  | "hank"
  | "rambo"
  | "sac-apimetricsdata-api"
  | "vetinsight"
  | "aap-bulkexport-api"
  | "aap-npasignup-api"
  | "aap-petlist-api"
  | "petsearch"
  | "aap-rehome-svc"
  | "aap-search-api"
  | "ok-pet-profile-svc"
  | "ok-user-profile-svc"
  | "ok-goodfriend-petexec-int"
  | "thewildest"
  | "pe-frontend"
  | "pe-backend"
  | "ok-subscription-core-svc"
  | "ok-health-svc"
  | "ki-identity-svc"
  | "ki-document-svc"
  | "wp-wisdom-svc"
  | "marsveterinary"
  | "ok-note-svc"
  | "ok-tag-svc"
  | "api-automation-postman"
  | "ok-okta-event-webhook-svc"
  | "gf-provider-api"
  | "gf-web"
  | "the-kin-content-api"
  | "ok-payment-svc"
  | "the-kin-content-api-test"
  | "infrastructure-packages"
  | "the-kin-vet-chat-summary"
  | "ok-notification-svc"
  | "kinship-kafka"
  | "ok-back4app-svc"
  | "the-kin-website"
  | "newrelic-stats"
  | "the-kin-short-links"
  | "the-kin-api"
  | "device-data-warehouse"
  | "pe-svc"
  | "goodfriend-website"
  | "goodfriend-api"


export type K8sClusterPermission = "clusterAdmin" | "viewOnly"
type K8sRbac = PartialRecord<Environments, K8sClusterPermission>

export type User = {
  /**
   * Their legal name
   */
  name: string
  email?: string
  awsAccess?: {
    [key in AwsAccount]?: key extends "whistleSoftware"
      ? {
          /**
           * This is to accomodate legacy users that existed before this codebase. It will not result in created users.
           */
          legacyIamArn?: string
          /**
           * This will cause an IAM user to be created. All users are created within the Whistle AWS account. Access to other AWS accounts
           * are done withrough role assumption.
           */
          iamArn?: string
        }
      : {
          /**
           * This will cause an IAM role to be created. This role will be used to authenticate to EKS clusters within the AWS account.
           * The name of the role must match the user's IAM username. Even though it's more "correct" to reference it from a Pulumi
           * stack output, our code is simplified if we request this roleArn here.
           */
          roleArn: string
        }
  }
  /**
   * Grants user "admin" permissions to these projects, including but not necessarily limited to
   * running production systems and the Pulumi stack encryption key.
   */
  memberOfProjects?: Array<Projects>
  /**
   * Grants permissions to various Kubernetes clusters
   */
  k8sRbac?: { [key in AwsAccount]?: K8sRbac }
  /**
   * Grants Github access to the Kinship-Partners-Inc Github org: https://github.com/Kinship-Partners-Inc
   */
  github?: {
    handle: string
    role?: MembershipRoles
    teams: Array<TeamNames>
  }
  /**
   * Adds user to PagerDuty schedule for any listed projects.
   */
  pagerDuty?: PagerDutyUser
}

export const userConfig: {users: Array<User>} = {
  users: [
    {
      name: "Devops CICD",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/service/cicd",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/cicd",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/cicd",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/cicd",
        },
      },

      memberOfProjects: [],
      k8sRbac: {
        aapOmega: {
          dev: "clusterAdmin",
        },
        kinshipSharedServices: {
          dev: "clusterAdmin",
          production: "clusterAdmin",
        },
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
    },
    {
      name: "Tony Walls",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/tony",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/tony",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/tony",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/tony",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/tony",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/tony",
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/tony",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/tony"
        },
      },
      memberOfProjects: [],
      k8sRbac: {
        aapOmega: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
        kinshipSharedServices: {
          dev: "viewOnly",
          staging: "viewOnly",
          production: "viewOnly",
        },
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
      github: {
        handle: "arwalls",
        role: "admin",
        teams: ["Hackathon2021aThePass", "Kinship", "ShelterAnimalsCount"]
      },
      pagerDuty: {
        name: "Tony Walls",
        email: "tony@whistle.com",
        role: "admin",
        createUser: false,
        jobTitle: "DevOps Manager",
        projects: [
          { name: slackMonitoringPlatformProject },
        ],
      },
    },
    {
    name: "Rodrigo Morales",
    email: "rodrigo.morales.ext@kinship.co",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/rodrigo.morales",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/rodrigo.morales",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/rodrigo.morales",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/rodrigo.morales",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/rodrigo.morales",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/rodrigo.morales"
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/rodrigo.morales",
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/rodrigo.morales",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/rodrigo.morales",
        },
        GoodFriend: {
          roleArn: "arn:aws:iam::419311880687:role/rodrigo.morales",
        },
      },
      memberOfProjects: [],
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
      github: {
        handle: "rodrigo-kinship",
        role: "admin",
        teams: ["Kinship", "ShelterAnimalsCount", "DataPlatform"]
      },
      pagerDuty: {
        name: "Rodrigo Morales",
        email: "rodrigo.morales.ext@kinship.co",
        role: "user",
        createUser: true,
        jobTitle: "DevOps Engineer",
        projects: [
          { name: "kinshipdataplatform" },
          { name: "pe-frontend" },
          { name: "pe-backend" },
          { name: "the-kin-content-api" },
          { name: "the-kin-vet-chat-summary" },
        ],
      },
    },
    {
      name: "Daniel Isaac",
      email: "isaac@unif.io",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/isaac",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/isaac",
        },
      },
      memberOfProjects: ["kong", "mparticlejob", "singlesignon", "userinfoconsumer", "userinfoproducer","aap-bulkexport-api", "aap-npasignup-api", "aap-petlist-api", "aap-search-api","server-data-processor", "petsearch"],
      k8sRbac: {
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
        kinshipSharedServices: {
          dev: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
      github: {
        handle: "disaac",
        role: "admin",
        teams: ["Unifio", "Kong", "Kinship", "KinshipIntegrations", "DataPlatform", "Omega"]
      },
      pagerDuty: {
        name: "Daniel Isaac",
        email: "isaac@unif.io",
        role: "admin",
        createUser: true,
        jobTitle: "Unif.io DevOps Consultant",
        projects: [
          { name: "kong" },
          { name: slackMonitoringPlatformProject },
        ],
      },
    },
    {
      name: "André Rohde",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/andrerohde",
        },
      },
      memberOfProjects: ["logfiles", "lola", "server", "server-data-processor"],
      k8sRbac: {
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
      github: { handle: "andrerohde", teams: ["Whistle", "WhistleSoftware"] },
    },
    {
      name: "Laura Nguyen",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/laura",
        },
      },
      memberOfProjects: ["logfiles", "lola", "server", "server-data-processor"],
      k8sRbac: {
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
      github: { handle: "lpopa", teams: ["Whistle", "WhistleSoftware"] },
    },
    {
      name: "Sean Tey",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/sean",
        },
      },
      memberOfProjects: ["server-data-processor"],
      k8sRbac: {
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      }, // github: { handle: "seantey-wk", teams: [] },
    },
    {
      name: "Sawyer Schumacher",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/sawyerschumacher",
        },
      },
      memberOfProjects: ["server-data-processor"],
      k8sRbac: {
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      }, // github: { handle: "Sschumac", teams: [] },
    },
    {
      name: "Lili Boxer",
      github: { handle: "liliboxer", teams: ["Hackathon2021aWizdle", "Wisdom", "Kinship"] },
    },
    {
      name: "Susan Puckett",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/susan.puckett",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/susan.puckett",
        },
      },
      github: { handle: "sepuckett86", teams: ["Hackathon2021aWizdle", "Wisdom", "Kinship"] },
    },
    {
      name: "Alex Ramirez de Cruz",
      github: { handle: "aramirezdecruz3148", teams: ["Hackathon2021aWizdle", "Wisdom", "Kinship"] },
    },
    {
      name: "Cheng-Tao Chen",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/cheng.tao.chen",
        },
        // kinshipDataPlatform: {
        //   roleArn: "arn:aws:iam::497842599452:role/cheng.tao.chen",
        // },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/cheng.tao.chen",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/cheng.tao.chen",
        }
      },
      memberOfProjects: ["userinfoconsumer", "userinfoproducer", "mparticlejob", "singlesignon"],
      github: {
        handle: "chengtaochen",
        teams: ["Hackathon2021aSanFranciscoMeows", "Kinship", "KinshipIntegrations", "ShelterAnimalsCount", "DataPlatform", "theKin"],
      },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "viewOnly",
        },
      },
      pagerDuty: {
        name: "Cheng-Tao Chen",
        email: "chengtao.chen@kinship.co",
        role: "user",
        createUser: true,
        jobTitle: "Development Manager",
        projects: [
          { name: "ki-document-svc" },
          { name: "ki-identity-svc" },
          { name: "kong" },
          { name: "mparticlejob" },
          { name: "ok-goodfriend-petexec-int" },
          { name: "ok-health-svc" },
          { name: "ok-note-svc" },
          { name: "ok-pet-profile-svc" },
          { name: "ok-subscription-core-svc" },
          { name: "ok-tag-svc" },
          { name: "ok-user-profile-svc" },
          { name: "server-data-processor" },
          { name: "ok-okta-event-webhook-svc" },
        ],
      },
    },
    {
      name: "Sumant Munjal",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/sumant.munjal",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/sumant.munjal",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/sumant.munjal",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/sumant.munjal",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/sumant.munjal",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/sumant.munjal",
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/sumant.munjal",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/sumant.munjal"
        },
      },
      memberOfProjects: ["userinfoconsumer", "userinfoproducer", "mparticlejob", "singlesignon", "kong"],
      github: { handle: "sumantkin", teams: ["Kinship", "KinshipIntegrations", "ShelterAnimalsCount", "Kong"] },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
      pagerDuty: {
        name: "Sumant Munjal",
        email: "sumant.munjal@kinship.co",
        role: "admin",
        createUser: true,
        jobTitle: "Director of Engineering, DevOps & API Management",
        projects: [
          { name: "aap-bulkexport-api" },
          { name: "aap-npasignup-api" },
          { name: "aap-petlist-api" },
          { name: "aap-search-api" },
          { name: "ki-document-svc" },
          { name: "ki-identity-svc" },
          { name: "kong" },
          { name: "mparticlejob" },
          { name: "ok-goodfriend-petexec-int" },
          { name: "ok-health-svc" },
          { name: "ok-note-svc" },
          { name: "ok-pet-profile-svc" },
          { name: "ok-subscription-core-svc" },
          { name: "ok-tag-svc" },
          { name: "ok-user-profile-svc" },
          { name: "server-data-processor" },
          { name: "ok-okta-event-webhook-svc" },
          { name: "vetinsight" },
          { name: "pe-frontend" },
          { name: "pe-backend" },
          { name: "the-kin-content-api" },
        ],
      },
    },
    {
      name: "Dariusz Dyrga",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/dariusz.dyrga",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/dariusz.dyrga",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/dariusz.dyrga",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/dariusz.dyrga",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/dariusz.dyrga",
        },
        GoodFriend: {
          roleArn: "arn:aws:iam::419311880687:role/dariusz.dyrga",
        },
      },
      memberOfProjects: ["mparticlejob"],
      github: {
        handle: "DDyrga",
        teams: ["KinshipIntegrations", "DataPlatform"],
      },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          production: "viewOnly",
        },
      },
    },
    {
      name: "Rob Weinhandl",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/rob.weinhandl",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/rob.weinhandl",
        },
      },
      k8sRbac: {
        aapOmega: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "viewOnly",
        },
      },
      memberOfProjects: ["petsearch", "aap-rehome-svc"],
      github: { handle: "rob-aap", teams: ["Adopt-a-Pet", "Omega"] },
    },
    {
      name: "Dusten Smith",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/dusten.smith",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/dusten.smith",
        },
      },
      k8sRbac: {
        aapOmega: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "viewOnly",
        },
      },
      memberOfProjects: ["petsearch", "aap-rehome-svc"],
      github: { handle: "dusten-aap", teams: ["Adopt-a-Pet", "Omega"] },
    },
    {
      name: "Tim Murphy",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/tim.murphy",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/tim.murphy",
        },
      },
      k8sRbac: {
        aapOmega: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "viewOnly",
        },
      },
      memberOfProjects: ["petsearch", "aap-rehome-svc"],
      github: { handle: "aap-tim", teams: ["Adopt-a-Pet", "Omega", "ShelterAnimalsCount"] },
    },
    {
      name: "Matt Christian",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/matt.christian",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/matt.christian",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/matt.christian",
        },
      },
      k8sRbac: {
        kinshipDataPlatform: {
          dev: "clusterAdmin",
        },
        aapOmega: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "viewOnly",
        },
      },
      memberOfProjects: ["petsearch", "aap-rehome-svc"],
      github: { handle: "aap-matt", teams: ["Adopt-a-Pet", "Omega"] },
    },
    {
      name: "Ryan Garcia",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/ryan.garcia",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/ryan.garcia",
        },
      },
      memberOfProjects: ["petsearch"],
      github: { handle: "garciaryan", teams: ["Adopt-a-Pet", "Omega"] },
    },
    {
      name: "Becky McKimmy",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/becky.mckimmy",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/becky.mckimmy",
        },
      },
      memberOfProjects: ["petsearch"],
      github: { handle: "aap-becky", teams: ["Adopt-a-Pet", "Omega"] },
    },
    {
      name: "Ekaterina Blinova",
      github: { handle: "eBlinova", teams: ["Adopt-a-Pet", "AAP-Rehome"] },
    },
    {
      name: "Anton Shynkarenko",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/anton.shynkarenko",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/anton.shynkarenko",
        },
      },
      memberOfProjects: ["aap-rehome-svc"],
      github: { handle: "anton-shynkarenko", teams: ["Adopt-a-Pet", "AAP-Rehome"]}
    },
    {
      name: "Cassidy Harpster",
      github: { handle: "Cajam", teams: ["Adopt-a-Pet", "Kinship", "ShelterAnimalsCount"] },
    },
    {
      name: "Sridevi Gouni",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/sridevi.gouni",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/sridevi.gouni",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/sridevi.gouni",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/sridevi.gouni",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/sridevi.gouni",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/sridevi.gouni",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/sridevi.gouni"
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/sridevi.gouni",
        },
      },
      github: { handle: "sridevigouni", teams: ["Kinship", "ShelterAnimalsCount", "DataPlatform", "QA-Automation"] },
    },
    {
      name: "Isabel van Zijl",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/isabel.vanzijl",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/isabel.vanzijl",
        },
      },
      github: { handle: "isabelvanzijl", teams: ["ShelterAnimalsCount", "DataPlatform"] },
    },
    {
      name: "Jason Huff",
      github: { handle: "jhuff-genomics", teams: ["Wisdom","Templates"] },
    },
    {
      name: "Michael Denyer",
      github: { handle: "michael-denyer", teams: ["Wisdom","Templates","Kinship"] },
    },
    {
      name: "Ankit Chaudhary",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/ankit.chaudhary",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/ankit.chaudhary",
        },
      },
      github: { handle: "ankitchaudhary23", teams: ["DataPlatform","Wisdom"] },
    },
    {
      name: "Aaron Renoir",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/aaron.renoir",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/aaron.renoir",
        },
      },
      github: { handle: "arenoir", teams: ["Wisdom"] },
    },
    {
      name: "Eddie King",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/eddie.king",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/eddie.king",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/eddie.king",
        },
        GoodFriend: {
          roleArn: "arn:aws:iam::419311880687:role/eddie.king",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/eddie.king",
        },
      },
      memberOfProjects: ["gf-web", "gf-provider-api"],
      github: { handle: "code4good", teams: ["Wisdom", "Barkibu", "theKin", "GoodFriend", "Kinship-co", "PetExec", "VetInsight"] },
    },
    {
      name: "Larry Gebhardt",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/larry.gebhardt",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/larry.gebhardt",
        },
      },
      github: { handle: "lgebhardt", teams: ["Wisdom"] },
    },
    {
      name: "Luke Eldridge",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/luke.eldridge",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/luke.eldridge",
        },
      },
      github: { handle: "jleldridge", teams: ["Wisdom"] },
    },
    {
      name: "Robia Charles",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/robia.charles",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/robia.charles",
        },
      },
    },
    {
      name: "Deepthi Menon",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/deepthi.menon",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/deepthi.menon",
        },
      },
    },
    {
      name: "Samuel Munyili",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/samuel.munyili",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/samuel.munyili",
        },
      },
      memberOfProjects: ["mparticlejob", "shelteranimalscount"],
      github: { handle: "munyili-samuel", teams: ["KinshipIntegrations", "ShelterAnimalsCount"] },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
    },
    {
      name: "Mykola Gnatyshyn",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/mykola.gnatyshyn",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/mykola.gnatyshyn",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/mykola.gnatyshyn",
        }
      },
      memberOfProjects: ["aap-bulkexport-api", "aap-npasignup-api", "aap-petlist-api", "aap-search-api",
      "ki-document-svc", "ki-identity-svc", "ok-health-svc", "ok-note-svc", "ok-okta-event-webhook-svc",
      "ok-tag-svc","ok-pet-profile-svc", "ok-user-profile-svc", "mparticlejob", "ok-notification-svc", "ok-back4app-svc", "ok-subscription-core-svc"],
      github: { handle: "mgnatyshyn", teams: ["Kinship", "KinshipIntegrations", "Kong", "TheWildest"] },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
    },
    {
      name: "Scott Hilson",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/scott.hilson",
        },
        GoodFriend: {
          roleArn: "arn:aws:iam::419311880687:role/scott.hilson",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/scott.hilson",
        },
      },
      memberOfProjects: [
      "gf-web",
      "gf-provider-api",
      "ki-document-svc",
      "ok-user-profile-svc",
      "ok-pet-profile-svc",
      "ok-notification-svc"
    ],
      github: { handle: "scotthillson", teams: ["Wisdom", "GoodFriend", "KinshipIntegrations"] },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
    },
    {
      name: "Mia Balsamo",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/miabalsamo",
        },
      },
      memberOfProjects: ["logfiles", "lola", "server", "server-data-processor"],
      k8sRbac: {
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
      github: { handle: "mbalsamo2", teams: ["Whistle", "WhistleSoftware"] },
    },
    {
      name: "Dan Garrigan",
      github: { handle: "popgendad", teams: ["Wisdom"] },
    },
    {
      name: "Artem Launets",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/artem.launets",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/artem.launets",
        },
      },
      memberOfProjects: ["aap-bulkexport-api", "aap-npasignup-api", "aap-petlist-api", "aap-search-api", "ok-user-profile-svc", "ok-pet-profile-svc", "ki-document-svc"],
      github: { handle: "artem-kinship", teams: ["Kinship", "KinshipIntegrations"] },
    },
    {
      name: "Oleksandr Rudenko",
      email: "oleksandr.rudenko.ext@kinship.co",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/oleksandr.rudenko",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/oleksandr.rudenko",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/oleksandr.rudenko",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/oleksandr.rudenko",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/oleksandr.rudenko",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/oleksandr.rudenko",
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/oleksandr.rudenko",
        },
      },
      memberOfProjects: ["mparticlejob", "singlesignon", "kong", "kinshipdataplatform", "shelteranimalscount", "server-data-processor"],
      k8sRbac: {
        aapOmega: {
          dev: "clusterAdmin",
        },
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
      github: {
        handle: "oleksandr-kinship",
        role: "admin",
        teams: ["Kinship", "ShelterAnimalsCount", "KinshipIntegrations", "DataPlatform", "Kong", "GoodFriend"]
      },
      pagerDuty: {
        name: "Oleksandr Rudenko",
        email: "oleksandr.rudenko.ext@kinship.co",
        role: "admin",
        createUser: true,
        jobTitle: "DevOps Engineer",
        projects: [
          { name: "aap-bulkexport-api" },
          { name: "aap-npasignup-api" },
          { name: "aap-petlist-api" },
          { name: "aap-search-api" },
          { name: "ki-document-svc" },
          { name: "ki-identity-svc" },
          { name: "kong" },
          { name: "mparticlejob" },
          { name: "ok-goodfriend-petexec-int" },
          { name: "ok-health-svc" },
          { name: "ok-note-svc" },
          { name: "ok-pet-profile-svc" },
          { name: "ok-subscription-core-svc" },
          { name: "ok-tag-svc" },
          { name: "ok-user-profile-svc" },
          { name: "server-data-processor" },
          { name: "ok-okta-event-webhook-svc" },
          { name: "ok-notification-svc" },
          { name: "ok-back4app-svc" },
          { name: "kinship-kafka" },
        ],
      },
    },
    {
      name: "Vladimir Shkodin",
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
      github: { handle: "vshkodin", teams: ["QA-Automation", "Barkibu", "VetInsight"] },
    },
    {
      name: "Hany Sayed",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/hany.sayed",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/hany.sayed",
        },
      },
      github: { handle: "h4hany", teams: ["Barkibu", "VetInsight", "theKin"] },
    },
    {
      name: "Srikanth Korada",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/srikanth.korada",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/srikanth.korada",
        },
      },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
      github: { handle: "srikanth-kinship", teams: ["QA-Automation", "KinshipIntegrations"] },
    },
    {
      name: "Rathna Kolluru",
      github: { handle: "rkollu", teams: ["QA-Automation"] },
    },
    {
      name: "Denis Gathondu",
      github: { handle: "gathondu", teams: ["ShelterAnimalsCount"] },
    },
    {
      name: "Sidymar Prexedes",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/sidymar.prexedes",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/sidymar.prexedes",
        },
      },
      github: { handle: "sidymar-prexedes-kinship", teams: ["DataPlatform"] },
    },
    {
      name: "Ostap Partyka",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/ostap.partyka",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/ostap.partyka",
        }
      },
    },
    {
      name: "Bryan Clement",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/bryan.clement",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/bryan.clement",
        }
      },
      github: { handle: "lykkin", teams: ["theKin", "TheWildest"] },
    },
    {
      name: "Mayur Patil",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/mayur.patil",
        }
      },
    },
    {
      name: "Aditya Dabade",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/aditya.dabade",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/aditya.dabade",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/aditya.dabade",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/aditya.dabade",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/aditya.dabade",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/aditya.dabade",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/aditya.dabade"
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/aditya.dabade",
        },
      },
    },
    {
      name: "Andy Beaudoin",
      github: { handle: "abeaudoin2013", teams: ["Wisdom"] },
    },
    {
      name: "Omar Reyes",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/omar.reyes",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/omar.reyes"
        }
      },
      github: {
        handle: "mromarreyes",
        teams: ["PetExec", "theKin"]
      },
    },
    {
      name: "Rahul Raj",
      github: {
        handle: "rahulz2022",
        role: "admin",
        teams: ["Kinship"]
      },
    },
    {
      name: "Julien Defrance",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/julien.defrance",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/julien.defrance",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/julien.defrance",
        }
      },
      memberOfProjects: ["logfiles", "lola", "server", "server-data-processor"],
      k8sRbac: {
        whistleSoftware: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
      github: { handle: "JulienDefrance", teams: ["Whistle", "WhistleSoftware", "Barkibu", "TheWildest", "VetInsight"] },
      pagerDuty: {
        name: "Julien Defrance",
        email: "julien.defrance@kinship.co",
        role: "user",
        createUser: true,
        jobTitle: "Principal Software Engineer",
        projects: [
          { name: "the-kin-content-api" },
          { name: "the-kin-vet-chat-summary" },
        ],
      },
    },
    {
      name: "Oleksandr Raienko",
      github: {
        handle: "raienkoa",
        teams: ["theKin"]
      },
    },
    {
      name: "Rafael Ferreira",
      github: {
        handle: "rafaerferreira",
        teams: ["theKin"]
      },
    },
    {
      name: "Gbenga Oshinaga",
      github: {
        handle: "GbengaOshinaga",
        teams: ["theKin"]
      },
    },
    {
      name: "Theoderic Onipe",
      github: {
        handle: "theodericonipe1",
        teams: ["theKin"]
      },
    },
    {
      name: "Jesse Gonzalez",
      github: {
        handle: "jegouxd",
        teams: ["theKin"]
      },
     },
     {
      name: "Adam Berlinsky",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/adam.berlinsky",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/adam.berlinsky",
        },
        adoptapet: {
          roleArn: "arn:aws:iam::069716362557:role/adam.berlinsky",
        }
      },
      memberOfProjects: ["petsearch", "aap-rehome-svc"],
      github: {
        handle: "atomos",
        teams: ["Adopt-a-Pet", "Omega", "ShelterAnimalsCount"]
      },
    },
    {
      name: "Alden Brown",
      github: {
        handle: "aldenfbrown",
        teams: ["GoodFriend", "Barkibu", "theKin", "VetInsight"]
      },
    },
    {
      name: "Ryan Willoughby",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/ryan.willoughby",
        },
        GoodFriend: {
          roleArn: "arn:aws:iam::419311880687:role/ryan.willoughby",
        },
      },
      memberOfProjects: ["gf-web", "gf-provider-api"],
      github: {
        handle: "wildabeast",
        teams: ["GoodFriend", "Barkibu", "theKin", "VetInsight"]
      },
    },
    {
      name: "Khaled Zaher",
      github: {
        handle: "khaledm356",
        teams: ["GoodFriend", "TheWildest", "theKin"]
      },
    },
    {
      name: "Oscar Luza",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/oscar.luza",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/oscar.luza",
        },
      },
      github: {
        handle: "NashL",
        teams: ["GoodFriend", "Barkibu", "Adopt-a-Pet", "Omega", "VetInsight"]
      },
    },
    {
      name: "Amrinder Jabbal",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/amrinder.jabbal",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/amrinder.jabbal",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/amrinder.jabbal",
        },
      },
      github: {
        handle: "amrinder-kinship",
        teams: ["GoodFriend", "Barkibu", "VetInsight", "theKin"]
      },
    },
    {
    name: "Sijibomi Ajayi",
      email: "sijibomi.ajayi.ext@kinship.co",
        awsAccess: {
          whistleSoftware: {
            legacyIamArn: "arn:aws:iam::419697633145:user/sijibomi.ajayi",
          },
          kinshipSharedServices: {
            roleArn: "arn:aws:iam::575036886166:role/sijibomi.ajayi",
          },
          kinshipDataPlatform: {
            roleArn: "arn:aws:iam::497842599452:role/sijibomi.ajayi",
          },
          vetInsight: {
            roleArn: "arn:aws:iam::672673849622:role/sijibomi.ajayi",
          },
          theWildest: {
            roleArn: "arn:aws:iam::275408611384:role/sijibomi.ajayi",
          },
          PetExec: {
            roleArn: "arn:aws:iam::784077888162:role/sijibomi.ajayi"
          },
          aapOmega: {
            roleArn: "arn:aws:iam::682251556248:role/sijibomi.ajayi",
          },
          marsVeterinary: {
            roleArn: "arn:aws:iam::427923610750:role/sijibomi.ajayi",
          },
        },
        memberOfProjects: [],
        k8sRbac: {
          kinshipSharedServices: {
            dev: "clusterAdmin",
            staging: "clusterAdmin",
            production: "clusterAdmin",
          },
          whistleSoftware: {
            dev: "clusterAdmin",
            staging: "clusterAdmin",
            production: "clusterAdmin",
          },
        },
        github: {
          handle: "sijibomi-kinship",
          role: "admin",
          teams: ["Kinship", "ShelterAnimalsCount", "DataPlatform", "TheWildest"]
        },
        pagerDuty: {
          name: "Sijibomi Ajayi",
          email: "sijibomi.ajayi.ext@kinship.co",
          role: "user",
          createUser: true,
          jobTitle: "DevOps Engineer",
          projects: [
            { name: "vetinsight" },
            { name: "pe-frontend" },
            { name: "pe-backend" },
          ],
        },
      },
      {
        name: "Chris Pedulla",
        github: {
          handle: "cpedulla",
          teams: ["PetExec"]
        },
      },
      {
        name: "Nathan Krueger",
        github: {
          handle: "nkrueger-hiveway",
          teams: ["PetExec"]
        },
      },
      {
        name: "Naeem Piracha",
        github: {
          handle: "naimp",
          teams: ["PetExec"]
        },
      },
      {
        name: "Donna Huang",
        github: {
          handle: "Donnana-hiveway",
          teams: ["PetExec"]
        },
      },
      {
        name: "Venetia Yong Tim",
        github: { handle: "venetiayongtim", teams: ["Barkibu", "VetInsight"] },
      },
      {
        name: "Vadim Tchernine",
        github: {
          handle: "vadimkinship",
          teams: ["theKin"]
        },
      },
      {
        name: "Yaroslav Zhabko",
        awsAccess: {
          whistleSoftware: {
            legacyIamArn: "arn:aws:iam::419697633145:user/yaroslav.zhabko",
          },
        },
        memberOfProjects: ["logfiles", "lola", "server", "server-data-processor"],
        k8sRbac: {
          whistleSoftware: {
            dev: "clusterAdmin",
            staging: "viewOnly",
            production: "viewOnly",
          },
        },
      },
      {
        name: "Lindolfo Rodrigues",
        awsAccess: {
          whistleSoftware: {
            legacyIamArn: "arn:aws:iam::419697633145:user/lindolfo.rodrigues",
          },
        },
        memberOfProjects: ["logfiles", "lola", "server", "server-data-processor"],
        k8sRbac: {
          whistleSoftware: {
            dev: "clusterAdmin",
            staging: "viewOnly",
            production: "viewOnly",
          },
        },
      },
      {
      name: "David Meade",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/david.meade",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/david.meade",
        }
      },
      github: { handle: "Dman757", teams: ["theKin", "TheWildest"] },
    },
    {
    name: "Bhavinkumar Prajapati",
      awsAccess: {
        whistleSoftware: {
          legacyIamArn: "arn:aws:iam::419697633145:user/bhavinkumar.prajapati",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/bhavinkumar.prajapati",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/bhavinkumar.prajapati",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/bhavinkumar.prajapati",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/bhavinkumar.prajapati",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/bhavinkumar.prajapati"
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/bhavinkumar.prajapati",
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/bhavinkumar.prajapati",
        },
        wisdomPanel: {
          roleArn: "arn:aws:iam::561064958971:role/bhavinkumar.prajapati",
        },
        GoodFriend: {
          roleArn: "arn:aws:iam::419311880687:role/bhavinkumar.prajapati",
        },
      },
      memberOfProjects: [],
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "clusterAdmin",
          production: "clusterAdmin",
        },
      },
      github: {
        handle: "Bhavin-kinship",
        role: "admin",
        teams: ["Kinship", "ShelterAnimalsCount", "DataPlatform"]
      },
      pagerDuty: {
        name: "Bhavinkumar Prajapati",
        email: "bhavinkumar.prajapati.ext@kinship.co",
        role: "user",
        createUser: true,
        jobTitle: "DevOps Engineer",
        projects: [
          { name: "aap-bulkexport-api" },
          { name: "aap-npasignup-api" },
          { name: "aap-petlist-api" },
          { name: "aap-search-api" },
          { name: "petsearch" },
          { name: "sac-apimetricsdata-api" },
          { name: "aap-rehome-svc" },
          { name: "gf-web" },
          { name: "gf-provider-api" },
          { name: "wp-wisdom-svc" },
        ],
      },
    },
    {
      name: "Moses Mugisha",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/moses.mugisha",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/moses.mugisha",
        },
      },
      github: {
        handle: "mossplix",
        teams: ["Barkibu", "VetInsight", "theKin"]
      },
    },
    {
      name: "Samantha Hill", // ShelterAnimalsCount IT Director
      github: {
        handle: "Samanthah-sac",
        teams: ["ShelterAnimalsCount"]
      },
    },
    {
      name: "Michelle Brodbeck", // ShelterAnimalsCount IT Member
      github: {
        handle: "mbrodbeckSAC",
        teams: ["ShelterAnimalsCount"]
      },
    },
    {
      name: "Sodiq Aderibigbe",
      github: {
        handle: "deyemiobaa",
        teams: ["ShelterAnimalsCount"]
      },
    },
    {
      name: "Gustavo Carletto",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/gustavo.carletto",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/gustavo.carletto",
        }
      },
    },
    {
      name: "Frances Vega",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/frances.vega",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/frances.vega",
        }
      },
    },
    {
      name: "Bolaji Ajani",
      github: { handle: "bjthecod3r", teams: ["Adopt-a-Pet"] },
    },
    {
      name: "Divyanshu Srivastava",
      github: { handle: "DivyanshuSrivastava1", teams: ["Barkibu", "VetInsight"] },
    },
    {
      name: "Onkar Daiv",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/onkar.daiv",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/onkar.daiv",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/onkar.daiv",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/onkar.daiv",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/onkar.daiv",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/onkar.daiv",
        },
        PetExec: {
          roleArn: "arn:aws:iam::784077888162:role/onkar.daiv"
        },
        marsVeterinary: {
          roleArn: "arn:aws:iam::427923610750:role/onkar.daiv",
        },
        GoodFriend: {
          roleArn: "arn:aws:iam::419311880687:role/onkar.daiv",
        },
        adoptapet: {
          roleArn: "arn:aws:iam::069716362557:role/onkar.daiv",
        }
      },
    },
    {
      name: "Rob Steinberg",
      github: { handle: "robsteinberg", teams: ["Barkibu", "VetInsight"] },
    },
    {
      name: "Gustavo Carletto",
      github: { handle: "gucarletto", teams: ["TheWildest"] },
    },
    {
      name: "Andrei Varapayeu",
      github: { handle: "thisavoropaev", teams: ["TheWildest"] },
    },
    {
      name: "Bolaji Ajani",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/bolaji.ajani",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/bolaji.ajani",
        }
      },
    },
    {
      name: "Taheerat Olajide",
      github: {
        handle: "Tolajide",
        teams: ["Adopt-a-Pet", "Omega"]
      },
    },
    {
      name: "Sateesh Charupati",
      email: "sateesh.charupati.ext@kinship.co",
        awsAccess: {
          whistleSoftware: {
            legacyIamArn: "arn:aws:iam::419697633145:user/sateesh.charupati",
          },
          kinshipSharedServices: {
            roleArn: "arn:aws:iam::575036886166:role/sateesh.charupati",
          },
          kinshipDataPlatform: {
            roleArn: "arn:aws:iam::497842599452:role/sateesh.charupati",
          },
          vetInsight: {
            roleArn: "arn:aws:iam::672673849622:role/sateesh.charupati",
          },
          theWildest: {
            roleArn: "arn:aws:iam::275408611384:role/sateesh.charupati",
          },
          PetExec: {
            roleArn: "arn:aws:iam::784077888162:role/sateesh.charupati"
          },
          aapOmega: {
            roleArn: "arn:aws:iam::682251556248:role/sateesh.charupati",
          },
          marsVeterinary: {
            roleArn: "arn:aws:iam::427923610750:role/sateesh.charupati",
          },
          wisdomPanel: {
            roleArn: "arn:aws:iam::561064958971:role/sateesh.charupati",
          },
          GoodFriend: {
            roleArn: "arn:aws:iam::419311880687:role/sateesh.charupati",
          },
        },
        memberOfProjects: [],
        k8sRbac: {
          aapOmega: {
            dev: "clusterAdmin",
          },
          kinshipSharedServices: {
            dev: "clusterAdmin",
            staging: "clusterAdmin",
            production: "clusterAdmin",
          },
        },
        github: {
          handle: "sateesh0414",
          role: "admin",
          teams: ["Kinship"]
        },
    },
    {
      name: "Kevin Lohchab",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/kevin.lohchab",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/kevin.lohchab",
        }
      },
    },
    {
      name: "Gabriel Dagadu",
      github: {
        handle: "dagasonhackason",
        teams: ["theKin", "TheWildest", "VetInsight"]
      },
    },
    {
      name: "Firmo Holanda",
      github: {
        handle: "firmoholanda",
        teams: ["theKin"]
      },
    },
    {
      name: "Olumide Falomo",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/olumide.falomo",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/olumide.falomo",
        }
      },
      github: {
        handle: "olucode-andela",
        teams: ["TheWildest-UK"]
      },
    },
    {
      name: "Kehinde Owoputi",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/kehinde.owoputi",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/kehinde.owoputi",
        }
      },
      github: {
        handle: "sirkenedy",
        teams: ["TheWildest-UK"]
      },
    },
    {
      name: "Carl Amegashie",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/carl.amegashie",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/carl.amegashie",
        }
      },
      github: {
        handle: "Carl2882",
        teams: ["TheWildest-UK"]
      },
    },
    {
      name: "Rufus Ngugi",
      github: {
        handle: "rufusmbugua",
        teams: ["Adopt-a-Pet", "Omega", "ShelterAnimalsCount"]
      },
    },
    {
      name: "Gaurav Dhiman",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/gaurav.dhiman",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/gaurav.dhiman",
        },
      },
    },
    {
      name: "Paul Sony",
      email: "paul.sony.ext@kinship.co",
        awsAccess: {
          whistleSoftware: {
            legacyIamArn: "arn:aws:iam::419697633145:user/paul.sony",
          },
          kinshipSharedServices: {
            roleArn: "arn:aws:iam::575036886166:role/paul.sony",
          },
          kinshipDataPlatform: {
            roleArn: "arn:aws:iam::497842599452:role/paul.sony",
          },
          vetInsight: {
            roleArn: "arn:aws:iam::672673849622:role/paul.sony",
          },
          theWildest: {
            roleArn: "arn:aws:iam::275408611384:role/paul.sony",
          },
          PetExec: {
            roleArn: "arn:aws:iam::784077888162:role/paul.sony"
          },
          aapOmega: {
            roleArn: "arn:aws:iam::682251556248:role/paul.sony",
          },
          marsVeterinary: {
            roleArn: "arn:aws:iam::427923610750:role/paul.sony",
          },
          wisdomPanel: {
            roleArn: "arn:aws:iam::561064958971:role/paul.sony",
          },
          GoodFriend: {
            roleArn: "arn:aws:iam::419311880687:role/paul.sony",
          },
        },
        github: {
          handle: "paulsony13",
          role: "admin",
          teams: ["Kinship", "TheWildest", "DataPlatform", "TheWildest-UK"]
        },
      },
      {
        name: "Emmanuel Tagbor",
        awsAccess: {
          whistleSoftware: {
            iamArn: "arn:aws:iam::419697633145:user/emmanuel.tagbor",
          },
          theWildest: {
            roleArn: "arn:aws:iam::275408611384:role/emmanuel.tagbor",
          }
        },
        github: {
          handle: "KingEmma7",
          teams: ["TheWildest-UK"]
        },
      },
      {
        name: "Barani Subramaniyan",
        github: {
          handle: "barani-subramaniyan",
          teams: ["TheWildest"]
        },
      },
      {
        name: "Allan Situma",
        github: {
          handle: "AllanSituma",
          teams: ["TheWildest", "VetInsight", "theKin"]
        },
      },
      {
        name: "Samson Nwokike",
        github: {
          handle: "sir-radar",
          teams: ["TheWildest-UK"]
        },
      },
      {
        name: "Derric George",
        awsAccess: {
          whistleSoftware: {
            iamArn: "arn:aws:iam::419697633145:user/derric.george",
          },
          kinshipSharedServices: {
            roleArn: "arn:aws:iam::575036886166:role/derric.george",
          },
        },
        github: {
          handle: "derricdani",
          teams: ["KinshipIntegrations"]
        },
        k8sRbac: {
          kinshipSharedServices: {
            dev: "clusterAdmin",
            staging: "viewOnly",
            production: "viewOnly",
          },
        },
      },
      {
        name: "Tulio Geniole",
        awsAccess: {
          whistleSoftware: {
            iamArn: "arn:aws:iam::419697633145:user/tulio.geniole",
          },
          kinshipDataPlatform: {
            roleArn: "arn:aws:iam::497842599452:role/tulio.geniole",
          },
        },
      },
      {
        name: "Sateesh Hoolimath",
        awsAccess: {
          whistleSoftware: {
            iamArn: "arn:aws:iam::419697633145:user/sateesh.hoolimath",
          },
          kinshipDataPlatform: {
            roleArn: "arn:aws:iam::497842599452:role/sateesh.hoolimath",
          },
        },
      },
      {
      name: "Mohamed Taher",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/mohamed.taher",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/mohamed.taher",
        }
      },
      github: { handle: "mohamed-taher-kinship", teams: ["theKin", "TheWildest"] },
    },
    {
      name: "Oyewole Oluwatobi",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/oyewole.oluwatobi",
        },
        theWildest: {
          roleArn: "arn:aws:iam::275408611384:role/oyewole.oluwatobi",
        }
      },
      github: { handle: "tobi-oye", teams: ["theKin", "TheWildest"] },
    },
    {
      name: "Shivaleela",
      github: { handle: "Shivaleela-Kinship", teams: ["QA-Automation"] },
    },
    {
      name: "Saswat Panigrahi",
      github: { handle: "saswatpanigrahi2023", teams: ["QA-Automation"] },
    },
    {
      name: "Abdullahi Aliyu",
      github: {
        handle: "abbaxee",
        teams: ["theKin"]
      },
    },
    {
      name: "Lucas Gerez",
      github: {
        handle: "LcsGrz",
        teams: ["theKin"]
      },
    },
    {
      name: "Victor Alagwu",
      github: {
        handle: "VictorAlagwu",
        teams: ["PetExec", "theKin"]
      },
    },
    {
      name: "Paulo Rodrigues",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/paulo.rodrigues",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/paulo.rodrigues",
        },
      },
    },
    {
      name: "Akansha Gupta",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/akansha.gupta",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/akansha.gupta",
        },
      },
    },
    {
      name: "Benny De Vera",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/benny.devera",
        },
        kinshipDataPlatform: {
          roleArn: "arn:aws:iam::497842599452:role/benny.devera",
        },
      },
    },
    {
      name: "Ullas Gupta",
      github: {
        handle: "samykills",
        teams: ["theKin"]
      },
    },
    {
      name: "Mykyta Tytov",
      github: {
        handle: "nikita-titov",
        teams: ["theKin"]
      },
    },
    {
      name: "Venkatesh Mallela",
      github: {
        handle: "venkateshmallela123",
        teams: ["theKin"]
      },
    },
    {
      name: "Meenakshi Takkelapati",
      github: {
        handle: "Meenakshi4573",
        teams: ["theKin"]
      },
    },
    {
      name: "Chandan Rai",
      github: {
        handle: "chankin567",
        teams: ["theKin"]
      },
    },
    {
      name: "Maninder Singh",
      github: {
        handle: "mandy0207",
        teams: ["theKin"]
      },
    },
    {
      name: "Rafael Mancini",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/rafael.mancini",
        },
        vetInsight: {
          roleArn: "arn:aws:iam::672673849622:role/rafael.mancini",
        },
      },
      github: { handle: "Mancini-Rafael", teams: ["Barkibu", "VetInsight", "theKin"] },
    },
    {
      name: "Alicia Archambault",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/alicia.archambault",
        },
        aapOmega: {
          roleArn: "arn:aws:iam::682251556248:role/alicia.archambault",
        },
      },
    },
    {
      name: "Kiran Sukumaran",
      awsAccess: {
        whistleSoftware: {
          iamArn: "arn:aws:iam::419697633145:user/kiran.sukumaran",
        },
        kinshipSharedServices: {
          roleArn: "arn:aws:iam::575036886166:role/kiran.sukumaran",
        },
      },
      github: {
        handle: "kiransukumaran93",
        teams: ["KinshipIntegrations"]
      },
      k8sRbac: {
        kinshipSharedServices: {
          dev: "clusterAdmin",
          staging: "viewOnly",
          production: "viewOnly",
        },
      },
    },
    {
      name: "Daniel Nascimento",
      github: { handle: "dpnascimento", teams: ["KinshipIntegrations"] },
    },
    {
      name: "Abhishel Kasera",
      github: { handle: "AbhishekKinship", teams: ["theKin", "TheWildest"] },
    },
    {
      name: "Ankur Chauhan",
      github: { handle: "ankurkinship", teams: ["theKin", "TheWildest"] },
    },
    {
      name: "Ankush Kumar",
      github: { handle: "KinShipAnkush", teams: ["theKin", "TheWildest"] },
    },
    {
      name: "Manan Sharma",
      github: { handle: "manankinship", teams: ["theKin", "TheWildest"] },
    },
    {
      name: "Vikas Mittal",
      github: { handle: "vikasinfobahn", teams: ["theKin", "TheWildest"] },
    },
  ]
}
