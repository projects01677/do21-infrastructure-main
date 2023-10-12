import {
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName , pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "../../kinshipDataPlatform/src/config"
import { ssm } from "@pulumi/aws"

const projectName = "kinshipdataplatform"

export const kinshipdataplatformProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWriteEcr(`kinship-data-platform/${projectName}`),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
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
    
