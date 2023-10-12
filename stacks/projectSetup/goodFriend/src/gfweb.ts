import { ssm } from "@pulumi/aws"
import {
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm,
  adminS3Bucket,
  adminRds,
  cloudwatchMonitoring,
  snsMonitoring,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import {
  pulumiStateBucketName,
  pagerDutyCriticalServiceIds,
  pagerDutyInfoServiceIds,
  newRelicAlertPoliciesIds,
} from "./config"
import { kmsKeyForSnapshots } from "../../../../utility/projectSetup/utils/manageRdsSnapshots"

const projectName = "gf-web"

export const gfwebProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(projectName),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    ...adminS3Bucket(projectName),
    ...adminRds(projectName),
    ...cloudwatchMonitoring(projectName),
    ...snsMonitoring(projectName),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
  ],
})

// PagerDuty AWS SSM outputs for universal accessibility
pagerDutyCriticalServiceIds.apply((sid) =>
  sid
    .filter((s) => s.project == projectName)
    .map(
      ({ project, id }) =>
        new ssm.Parameter(`${project}-criticalServiceId`, {
          name: `/pulumi/pagerduty/${project}/criticalServiceId`,
          type: "String",
          value: id,
        })
    )
)

pagerDutyInfoServiceIds.apply((sid) =>
  sid
    .filter((s) => s.project == projectName)
    .map(
      ({ project, id }) =>
        new ssm.Parameter(`${project}-infoServiceId`, {
          name: `/pulumi/pagerduty/${project}/infoServiceId`,
          type: "String",
          value: id,
        })
    )
)

// New Relic AWS SSM outputs for universal accessibility

newRelicAlertPoliciesIds.apply((sid) =>
  sid
    .filter((s) => s.project == projectName)
    .map(
      ({ environment, id, name, project }) =>
        new ssm.Parameter(`${project}-${environment}-${name}-Id`, {
          name: `/pulumi/newrelic/${project}/${environment}/resourceIds/${name}`,
          type: "String",
          value: id,
        })
    )
)

export const rdsExportKmsKey = kmsKeyForSnapshots(
  projectName,
  "arn:aws:iam::497842599452:role/preprod-AWSGlueServiceRole-glue-service-role"
)
