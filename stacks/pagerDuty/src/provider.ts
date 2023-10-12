import * as pagerduty from "@pulumi/pagerduty"
import { Config, secret } from "@pulumi/pulumi"

export const provider = new pagerduty.Provider("pagerDuty", {
  token: secret(process.env.PAGERDUTY_TOKEN).apply((s) => s as string)
    ?? (new Config("pagerduty")).requireSecret("token"),
  userToken: secret(process.env.PAGERDUTY_USER_TOKEN).apply((s) => s as string)
  ?? (new Config("pagerduty")).getSecret("token")
})
