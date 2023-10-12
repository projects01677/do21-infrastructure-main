import {
    adminMSKafka,
    cloudwatchLogging,
    cloudwatchMonitoring,
    ekslistAndDescribe,
    readAllPulumiSsmOutputs,
    readWriteEC2SecurityGroup,
    readWriteEcr,
    readWritePulumiStateAndSsm,
    snsMonitoring,
    writeSecretsManager,
  } from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds } from "./config"
import { ssm } from "@pulumi/aws"

const projectName = "kinship-kafka"

export const kinshipKafkaProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`kinship-shared-services`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    ...adminMSKafka(`${projectName}-*`),
    ...readWriteEC2SecurityGroup(projectName),
    ...cloudwatchLogging(projectName),
    ...writeSecretsManager(`AmazonMSK_${projectName}`),
    ...snsMonitoring(projectName),
    ...cloudwatchMonitoring(projectName),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
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
