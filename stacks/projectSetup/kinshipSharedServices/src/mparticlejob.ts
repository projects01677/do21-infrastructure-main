import {
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm,
  adminS3Bucket,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds } from "./config"
import { ssm } from "@pulumi/aws"

const projectName = "mparticlejob"

export const mparticlejobProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`kinship-shared-services/${projectName}`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    ...adminS3Bucket(projectName),
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
