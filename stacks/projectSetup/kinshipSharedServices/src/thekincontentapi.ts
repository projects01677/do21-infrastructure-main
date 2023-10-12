import { envOidcMap } from "../../../../utility/mapOidc"
import {
    ekslistAndDescribe,
    kafkaClusterAdmin,
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm,
  } from "../../../../utility/projectSetup/utils/iamPermissions"
import { iamRoleEKSsa } from "../../../../utility/projectSetup/utils/iamRoleEKSsa"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds } from "./config"
import { ssm } from "@pulumi/aws"

const projectName = "the-kin-content-api"

export const kincontentapiProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`kinship-shared-services`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    readAllPulumiSsmOutputs,
    ekslistAndDescribe,
  ],
})

// Create IRSA to allow wotk with kafka
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
        eksSaPermissions: [...kafkaClusterAdmin("kinship-kafka", env),],
        environment: env,
        oidcIssuerId: oidc,
        serviceAccountNamespace: projectName,
        serviceAccountName: projectName,
    })
}

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
