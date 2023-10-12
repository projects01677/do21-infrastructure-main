import { StackReference } from "@pulumi/pulumi"
import { interpolate } from "@pulumi/pulumi"
import { pagerDutySecheduleIdOutput } from "../../../monitoringConfig"
import { newrelicChannelIdOutput } from "../../../newRelic/config/config"

const awsAccountReference = new StackReference("aws-account-aap-omega")
const eksDevStackReference = new StackReference("eks-aap-omega-dev")
const eksStagingStackReference = new StackReference("eks-aap-omega-staging")
const eksProductionStackReference = new StackReference("eks-aap-omega-production")
const pagerDutyStackReference = new StackReference("pagerduty")

export const pulumiStateBucketName = awsAccountReference.getOutput("pulumiStateBucketName").apply(x=>x as string)
export const terraformStateBucketName = awsAccountReference.getOutput("terraformStateBucketName").apply(x=>x as string)
export const terraformDynamoDBLockTable = awsAccountReference.getOutput("terraformDynamoDBLockTable").apply(x=>x as string)
export const hostedzoneInternalDev = eksDevStackReference.getOutput("ingressInternalHostedZoneId").apply(x=>x as string)
export const hostedzoneInternalStaging = eksStagingStackReference.getOutput("ingressInternalHostedZoneId").apply(x=>x as string)
export const hostedzoneInternalProduction = eksProductionStackReference.getOutput("ingressInternalHostedZoneId").apply(x=>x as string)
export const hostedZonesIds = [interpolate`arn:aws:route53:::hostedzone/${hostedzoneInternalDev}`,
                               interpolate`arn:aws:route53:::hostedzone/${hostedzoneInternalStaging}`,
                               interpolate`arn:aws:route53:::hostedzone/${hostedzoneInternalProduction}`,
                              ]
export const pagerDutyCriticalServiceIds = pagerDutyStackReference.getOutput("criticalServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)
export const pagerDutyInfoServiceIds = pagerDutyStackReference.getOutput("infoServiceIds")
  .apply((pd) => pd as Array<pagerDutySecheduleIdOutput>)

// newRelic stack reference to get Outputs
const newRelicStackReference = new StackReference("newrelic-adopt-a-pet")
export const NEW_RELIC_USER_KEY = newRelicStackReference.getOutput("newRelicUserKey")
export const NEW_RELIC_LICENSE_KEY = newRelicStackReference.getOutput("newRelicLicenseKey")
export const NEW_RELIC_BROWSER_KEY = newRelicStackReference.getOutput("newRelicBrowserKey")
export const newRelicAlertPoliciesIds = newRelicStackReference.getOutput("alertPoliciesOut")
.apply((nr) => nr as Array<newrelicChannelIdOutput>)
