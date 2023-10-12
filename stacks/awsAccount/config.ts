import { Config } from "@pulumi/pulumi"
import { User, userConfig } from "../userConfig"

export type AwsAccount =
  | "kinshipSharedServices"
  | "kinshipDataPlatform"
  | "aapOmega"
  | "vetInsight"
  | "whistleSoftware"
  | "theWildest"
  | "PetExec"
  | "wisdomPanel"
  | "marsVeterinary"
  | "GoodFriend"
  | "adoptapet"

// whistleSoftware is the "main account" for the org
export const account = new Config().get("account") as AwsAccount

type Configuration = {
  name: string
  email: string
  parentId: "r-qj4c"
  eksUsers: Array<User>
}

export const config: Configuration =
  account == "kinshipSharedServices"
    ? {
        name: "Kinship Shared Services",
        email: "devops+kinship-shared-services@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.kinshipSharedServices?.roleArn != undefined
        ),
      }
    : account == "kinshipDataPlatform"
    ? {
        name: "Kinship Data Platform",
        email: "devops+kinship-data-platform@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.kinshipDataPlatform?.roleArn != undefined
        ),
      }
    : account == "aapOmega"
    ? {
        name: "Adopt-a-Pet Project Omega",
        email: "devops+aap-omega@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.aapOmega?.roleArn != undefined
        ),
      }
    : account == "vetInsight"
    ? {
        name: "VetInsight",
        email: "devops+vetinsight@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.vetInsight?.roleArn != undefined
        ),
      }
    : account == "theWildest"
    ? {
        name: "theWildest",
        email: "devops+thewildest@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.theWildest?.roleArn != undefined
        ),
      }
    : account == "PetExec"
    ? {
        name: "PetExec",
        email: "devops+petexec@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.PetExec?.roleArn != undefined
        ),
      }
    : account == "wisdomPanel"
    ? {
        name: "Wisdom Panel",
        email: "devops+wisdom+panel@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.wisdomPanel?.roleArn != undefined
        ),
      }
    : account == "marsVeterinary"
    ? {
        name: "Mars Veterinary",
        email: "devops+mars-veterinary@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.marsVeterinary?.roleArn != undefined
        ),
      }
    : account == "GoodFriend"
    ? {
        name: "GoodFriend",
        email: "devops+goodfriend@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.GoodFriend?.roleArn != undefined
        ),
      }
    : account == "adoptapet"
    ? {
        name: "Adopt-a-Pet",
        email: "devops+adoptapet@whistle.com",
        parentId: "r-qj4c",
        eksUsers: userConfig.users.filter(
          (u) => u.awsAccess?.adoptapet?.roleArn != undefined
        ),
      }
    : ({} as Configuration)
