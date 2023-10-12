import * as slack from "@pulumi/slack"
import { Config, secret } from "@pulumi/pulumi"

export const provider = new slack.Provider("slack", {
  token: (new Config("slack")).requireSecret("token") ?? secret(process.env.SLACK_TOKEN)
})
