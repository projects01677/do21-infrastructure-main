import * as newrelic from "@pulumi/newrelic"
import { Config, secret } from "@pulumi/pulumi"

export type newrelicAccount =
  | "Adopt-a-Pet"
  | "GoodFriend"
  | "Kinship.co"
  | "PetExec"
  | "theWildest"
  | "VetInsight"
  | "Whistle"
  | "WisdomPanel"

const pulumiConfig = new Config()

export const newrelicAccountName: newrelicAccount = pulumiConfig.require("newrelicAccountName")
export const newrelicAccountRegion = pulumiConfig.require("newrelicAccountRegion")
export const newrelicAccountId = pulumiConfig.requireNumber("newrelicAccountId")
export const newrelicWhistleAccountId = 315401
export const newRelicUserId = pulumiConfig.requireNumber("newrelicUserId")
/*
  Creating provider using Account Wide Devops User key but specifying Subaccount
  AccountID in provider.
  Sourcing the Account Wide apiKey first from Environment variable if set otherwise
  from newrelic:apiKey in config.
  https://www.pulumi.com/registry/packages/newrelic/installation-configuration/#configuring-credentials

*/
const apiKey = (new Config("newrelic")).getSecret("apiKey")! ?? secret(process.env.NEW_RELIC_API_KEY).apply(s => s as string)

export const provider = new newrelic.Provider("newrelic", {
  apiKey: apiKey.apply(s => s),
  region: newrelicAccountRegion,
  accountId: newrelicAccountId,
})
