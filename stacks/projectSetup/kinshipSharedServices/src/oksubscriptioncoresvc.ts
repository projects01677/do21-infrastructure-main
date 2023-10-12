import {
    ekslistAndDescribe,
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm,
    adminRds,
    snsMonitoring,
    cloudwatchMonitoring,
  } from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds } from "./config"
import { ssm } from "@pulumi/aws"

const projectName = "ok-subscription-core-svc"

export const oksubscriptioncoresvcProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`kinship-shared-services`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    ...adminRds("ok-subscription-core-svc"),
    ...snsMonitoring(projectName),
    ...cloudwatchMonitoring(projectName),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
    {
      Effect: "Allow",
      Action: ["rds:RestoreDBInstanceFromDBSnapshot"],
      Resource: [`arn:aws:rds:*:*:*:ok-subscription-core-svc-*`],
  }
  ],
})

// PagerDuty AWS SSM outputs for universal accessibility
pagerDutyCriticalServiceIds
  .apply((sid) => sid
    .filter((s) => s.project == projectName).map(
  ({ project, id }) =>
    new ssm.Parameter(`${project}-criticalServiceId`, {
      name: `/pulumi/pagerduty/${project}/criticalServiceId`,
      type: "String",
      value: id,
    })
))

pagerDutyInfoServiceIds
  .apply((sid) => sid
    .filter((s) => s.project == projectName).map(
  ({ project, id }) =>
    new ssm.Parameter(`${project}-infoServiceId`, {
      name: `/pulumi/pagerduty/${project}/infoServiceId`,
      type: "String",
      value: id,
    })
))

// New Relic AWS SSM outputs for universal accessibility
newRelicAlertPoliciesIds
.apply((sid) => sid
  .filter((s) => s.project == projectName).map(
  ({ environment, id, name, project }) =>
    new ssm.Parameter(`${project}-${environment}-${name}-Id`, {
      name: `/pulumi/newrelic/${project}/${environment}/resourceIds/${name}`,
      type: "String",
      value: id,
  })
))
