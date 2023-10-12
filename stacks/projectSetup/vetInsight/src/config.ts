import { StackReference } from "@pulumi/pulumi"
import { pagerDutySecheduleIdOutput } from "../../../monitoringConfig"
import { newrelicChannelIdOutput } from "../../../newRelic/config/config"

const awsAccountReference = new StackReference("aws-account-vetinsight")
export const pulumiStateBucketName = awsAccountReference.getOutput("pulumiStateBucketName").apply(x=>x as string)

// pagerDuty stack reference to get Outputs
const pagerDutyStackReference = new StackReference("pagerduty")
export const pagerDutyCriticalServiceIds = pagerDutyStackReference.getOutput("criticalServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
export const pagerDutyInfoServiceIds = pagerDutyStackReference.getOutput("infoServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)

// newRelic stack reference to get Outputs
const newRelicStackReference = new StackReference("newrelic-vetInsight")
export const NEW_RELIC_USER_KEY = newRelicStackReference.getOutput("newRelicUserKey")
export const NEW_RELIC_LICENSE_KEY = newRelicStackReference.getOutput("newRelicLicenseKey")
export const NEW_RELIC_BROWSER_KEY = newRelicStackReference.getOutput("newRelicBrowserKey")
export const newRelicAlertPoliciesIds = newRelicStackReference.getOutput("alertPoliciesOut")
.apply((nr) => nr as Array<newrelicChannelIdOutput>)
