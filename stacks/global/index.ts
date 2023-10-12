import { ssm } from "@pulumi/aws"
import { Config, getStack } from "@pulumi/pulumi"

const pulumiConfig = new Config()

export const NEW_RELIC_LICENSE_KEY = pulumiConfig.requireSecret("NEW_RELIC_LICENSE_KEY")
export const KINSHIP_NEW_RELIC_LICENSE_KEY = pulumiConfig.requireSecret("KINSHIP_NEW_RELIC_LICENSE_KEY")
export const AAP_NEW_RELIC_LICENSE_KEY = pulumiConfig.requireSecret("AAP_NEW_RELIC_LICENSE_KEY")
export const NEW_RELIC_DEVOPS_USER_KEY = pulumiConfig.requireSecret("NEW_RELIC_DEVOPS_USER_KEY")
export const NEW_RELIC_DEVOPS_USER_KEY_ACCT_ID = pulumiConfig.requireNumber("NEW_RELIC_DEVOPS_USER_KEY_ACCT_ID")
export const NEW_RELIC_SLACK_ALERT_WEBHOOK = pulumiConfig.requireSecret("NEW_RELIC_SLACK_ALERT_WEBHOOK")
export const VETINSIGHT_NEW_RELIC_LICENSE_KEY = pulumiConfig.requireSecret("VETINSIGHT_NEW_RELIC_LICENSE_KEY")
// AWS SSM outputs for universal accessibility
;[
    { name: "NEW_RELIC_LICENSE_KEY", value: NEW_RELIC_LICENSE_KEY },
    { name: "NEW_RELIC_SLACK_ALERT_WEBHOOK", value: pulumiConfig.requireSecret("NEW_RELIC_SLACK_ALERT_WEBHOOK") },
    { name: "server/staging/AMQP_URL", value: pulumiConfig.requireSecret("SERVER_STAGING_AMQP_URL") },
    { name: "server/production/AMQP_URL", value: pulumiConfig.requireSecret("SERVER_PRODUCTION_AMQP_URL") },
  ].map(
    ({ name, value }) =>
      new ssm.Parameter(name, {
        name: `/pulumi/${getStack()}/${name}`,
        type: "SecureString",
        value: value,
      })
  )
