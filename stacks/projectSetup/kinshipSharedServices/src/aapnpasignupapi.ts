import { ssm } from "@pulumi/aws"
import {
    ekslistAndDescribe,
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm,
  } from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { newRelicAlertPoliciesIds } from "./config"

const projectName = "aap-npasignup-api"

export const aapnpasignupapiProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`kinship-shared-services`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
  ],
})

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
