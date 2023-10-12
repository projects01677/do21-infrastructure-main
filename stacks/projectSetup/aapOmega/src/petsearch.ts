import { ssm } from "@pulumi/aws"
import {
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm,
    ekslistAndDescribe,
    adminS3Bucket,
    adminSQS,
    adminACM,
    updateRoute53Record,
    readWriteCloudFront,
    readWriteEC2SecurityGroup,
    readWriteElastiCache
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { terraformStateBucketName } from "./config"
import { terraformDynamoDBLockTable } from "./config"
import { hostedZonesIds } from "./config"
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds } from "./config"

const projectName = "petsearch"
const certRegion = "us-east-1"

export const petsearchProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWriteEcr(`aap-omega/${projectName}`),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
        ...adminS3Bucket(`${projectName}-assets`),
        ...adminSQS(`${projectName}-npa-queue`),
        ...adminACM(`${certRegion}`),
        ...updateRoute53Record(hostedZonesIds),
        ...readWriteElastiCache(projectName),
        ...readWriteEC2SecurityGroup(projectName),
        ...readWriteCloudFront,
        ekslistAndDescribe,
        readAllPulumiSsmOutputs,
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
