import { StackReference } from "@pulumi/pulumi"
import { pagerDutySecheduleIdOutput } from "../../../monitoringConfig"
const pagerDutyStackReference = new StackReference("pagerduty")

export const pagerDutyCriticalServiceIds = pagerDutyStackReference.getOutput("criticalServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
export const pagerDutyInfoServiceIds = pagerDutyStackReference.getOutput("infoServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
