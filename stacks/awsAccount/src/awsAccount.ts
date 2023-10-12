import * as aws from "@pulumi/aws"
import { Account } from "@pulumi/aws/organizations"
import { interpolate } from "@pulumi/pulumi"
import { config } from "../config"

export const awsAccount = new Account(
  config.name,
  {
    name: config.name,
    email: config.email,
    parentId: config.parentId,
  },
  { protect: true }
)

export const provider = new aws.Provider(
  /**
   * The ternary below is because renaming the provider causes resources that use the provider to be replaced.
   * If you really want to clean this up, you must fiddle with the statefile.
  */
  config.name == "Kinship Shared Services"
    ? "kinshipSharedServices"
    : config.name == "Kinship Data Platform"
      ? "kinshipDataPlatform"
      : config.name == "Adopt-a-Pet Project Omega"
        ? "aapOmega"
        : config.name == "Vet Insight"
        ? "vetInsight"
        : config.name == "The Wildest"
        ? "theWildest"
        : config.name == "PetExec"
        ? "PetExec"
        : config.name == "Wisdom Panel"
        ? "wisdomPanel"
        : "awsAccount",
  {
    allowedAccountIds: [awsAccount.id],
    region: "us-east-1",
    assumeRole: { roleArn: interpolate`arn:aws:iam::${awsAccount.id}:role/OrganizationAccountAccessRole` },
  }
)
