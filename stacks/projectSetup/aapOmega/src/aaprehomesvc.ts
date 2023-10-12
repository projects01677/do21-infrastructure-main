import { ssm, ses } from "@pulumi/aws"
import {
  ekslistAndDescribe,
  readAllPulumiSsmOutputs,
  readWriteEcr,
  deleteEcr,
  readWritePulumiStateAndSsm,
  adminS3Bucket,
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { envOidcMap } from "../../../../utility/mapOidc"
import { iamRoleEKSsa } from "../../../../utility/projectSetup/utils/iamRoleEKSsa"
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds } from "./config"

const projectName = "aap-rehome-svc"

export const envOidc = envOidcMap({
  envEksStackMap: [
    ["dev", "eks-aap-omega-dev"],
    ["staging", "eks-aap-omega-staging"],
    ["production", "eks-aap-omega-production"],
  ],
})

for (const [env, oidc] of envOidc) {
  const iamSaRole = iamRoleEKSsa({
    projectName,
    eksSaPermissions: [...adminS3Bucket(projectName)],
    environment: env,
    oidcIssuerId: oidc,
    serviceAccountNamespace: projectName,
    serviceAccountName: projectName,
  })
}

export const aaprehomesvcProject = projectSetup({
  projectName,
  cicdUserPermissions: [
    ...readWriteEcr(`aap-omega/${projectName}`),
    ...deleteEcr(`aap-omega/${projectName}/tmp`),
    ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
    ...adminS3Bucket(projectName),
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

const sesIdentity = new ses.DomainIdentity(
  "adoptapet",
  { domain: "adoptapet.com" },
  {
    protect: true,
  }
)

const sesConfigurationSet = new ses.ConfigurationSet("rehome", {
  deliveryOptions: {
      tlsPolicy: "Optional",
  },
  name: "Rehome",
  reputationMetricsEnabled: false,
  sendingEnabled: true,
}, {
  protect: true,
})
