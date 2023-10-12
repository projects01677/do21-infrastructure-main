import { StackReference } from "@pulumi/pulumi"
import { pagerDutySecheduleIdOutput } from "../../../monitoringConfig"

const pagerDutyStackReference = new StackReference("pagerduty")

const awsAccountReference = new StackReference("aws-account-kinship-data-platform")
export const pulumiStateBucketName = awsAccountReference.getOutput("pulumiStateBucketName").apply(x=>x as string)

export const pagerDutyCriticalServiceIds = pagerDutyStackReference.getOutput("criticalServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
export const pagerDutyInfoServiceIds = pagerDutyStackReference.getOutput("infoServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
