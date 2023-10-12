import {
  adminS3Bucket,
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  readWritePulumiStateAndSsm,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { envOidcMap } from "../../../../utility/mapOidc"
import { iamRoleEKSsa } from "../../../../utility/projectSetup/utils/iamRoleEKSsa"
import { newRelicAlertPoliciesIds } from "./config"
import { ssm } from "@pulumi/aws"

const projectName = "aap-bulkexport-api"

export const aapbulkexportapiProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`kinship-shared-services`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    ...adminS3Bucket(`${projectName}`),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
  ],
})

export const envOidc = envOidcMap({
  envEksStackMap: [
    ["dev", "eks-kinship-shared-services-dev"],
    ["staging", "eks-kinship-shared-services-staging"],
    ["production", "eks-kinship-shared-services-production"]
  ],
})

for (const [env, oidc] of envOidc) {
  const iamSaRole = iamRoleEKSsa({
    projectName,
    eksSaPermissions: [...adminS3Bucket(`${projectName}`)],
    environment: env,
    oidcIssuerId: oidc,
    serviceAccountNamespace: "aap-bulkexport-api",
    serviceAccountName: "bulkexport-api",
  })
}

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
