import {
    ekslistAndDescribe,
    readAllPulumiSsmOutputs,
    readWriteEcr,
    readWritePulumiStateAndSsm,
    adminRds,
    adminS3Bucket,
    adminGlue,
    athenaQuery,
    snsMonitoring,
    cloudwatchMonitoring
} from "../../../../utility/projectSetup/utils/iamPermissions"
import { projectSetup } from "../../../../utility/projectSetup/utils/projectSetup"
import { pulumiStateBucketName } from "./config"
import { pagerDutyCriticalServiceIds, pagerDutyInfoServiceIds } from "./config"
import { newRelicAlertPoliciesIds } from "./config"
import { ssm } from "@pulumi/aws"
import { envOidcMap } from "../../../../utility/mapOidc"
import { iamRoleEKSsa } from "../../../../utility/projectSetup/utils/iamRoleEKSsa"

const projectName = "kong"

export const kongProject = projectSetup({
    projectName,
    cicdUserPermissions: [
        ...readWriteEcr(`kinship-shared-services/${projectName}`),
        ...readWritePulumiStateAndSsm(pulumiStateBucketName, projectName),
        ...adminRds(projectName),
        ...adminS3Bucket(projectName),
        ...adminGlue(projectName),
        ...athenaQuery(),
        // Comented due: "cannot exceed quota for PolicySize: 6144"
        // ...snsMonitoring(projectName),
        // ...cloudwatchMonitoring(projectName),
        readAllPulumiSsmOutputs,
        ekslistAndDescribe,
        {
            Effect: "Allow",
            Action: ["ec2:CreateSecurityGroup", "ec2:DescribeSecurityGroups"],
            Resource: [`*`],
        },
        {
          Effect: "Allow",
          Action: "elasticloadbalancing:Describe*",
          Resource: `*`,
        },
    ],
})

// Create IRSA to allow update AAP data in kong-* buckets
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
    serviceAccountNamespace: "kong",
    serviceAccountName: "kong-aap",
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
