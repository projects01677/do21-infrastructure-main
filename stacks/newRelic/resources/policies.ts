import * as newrelic from "@pulumi/newrelic"
import { Environments } from "../../../utility/Environments"
import { Projects } from "../../userConfig"
import { projectEnvironments, projectEnvironment, projectConfigs, flattenAlertReturn, alertResourceRequired } from "../config/config"
import { provider } from "../config/provider"
export type alertPolicy = {
  alertPolicyInfo?: newrelic.AlertPolicy,
  alertPolicyCritical?: newrelic.AlertPolicy,
  alertPolicyGoldenSignals?: newrelic.AlertPolicy,
  alertPolicyPlatformInfrastructureCritical?: newrelic.AlertPolicy,
  alertPolicyPlatformInfrastructureInfo?: newrelic.AlertPolicy,
} & alertResourceRequired
export type policyName = keyof Omit<alertPolicy, keyof alertResourceRequired>
const alertPolicyInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertPolicy | undefined =>
  new newrelic.AlertPolicy(
    `${projectName}-${e}-alertPolicyInfo`,
    {
      name: `Informational Alert Policy - ${projectName}-${e}`,
      incidentPreference: "PER_POLICY",
    },
    { provider: provider }
  )

// Provision the alert policy for Critical Alerts
const alertPolicyCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertPolicy | undefined =>
  new newrelic.AlertPolicy(
    `${projectName}-${e}-alertPolicyCritical`,
    {
      name: `Critical Alert Policy - ${projectName}-${e}`,
      incidentPreference: "PER_POLICY",
    },
    { provider: provider }
  )

// Provision the alert policy for Golden Signals
const alertPolicyGoldenSignals = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertPolicy | undefined =>
  new newrelic.AlertPolicy(
    `${projectName}-${e}-alertPolicyGoldenSignals`,
    {
      name: `Golden Signals - ${projectName}-${e}`,
      incidentPreference: "PER_POLICY",
    },
    { provider: provider }
  )
// Provision the alert policy for Platform Infrastructure Alerts
const alertPolicyPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertPolicy | undefined =>
  new newrelic.AlertPolicy(
    `${projectName}-${e}-alertPolicyPlatformInfrastructureCritical`,
    {
      name: `Critical Platform Infrastructure - ${projectName}-${e}`,
      incidentPreference: "PER_POLICY",
    },
    { provider: provider }
  )
const alertPolicyPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertPolicy | undefined =>
  new newrelic.AlertPolicy(
    `${projectName}-${e}-alertPolicyPlatformInfrastructureInfo`,
    {
      name: `Info Platform Infrastructure - ${projectName}-${e}`,
      incidentPreference: "PER_POLICY",
    },
    { provider: provider }
  )
export const alertPolicies: Array<alertPolicy> =
  flattenAlertReturn<alertPolicy>(projectEnvironments.map((e) =>
    projectConfigs
      .filter(({ environments }) => environments[e] != undefined)
      .map(({ environments, projectName }): alertPolicy =>
      ({
        alertPolicyInfo: alertPolicyInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        alertPolicyCritical: alertPolicyCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        alertPolicyGoldenSignals: alertPolicyGoldenSignals({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        alertPolicyPlatformInfrastructureCritical: alertPolicyPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        alertPolicyPlatformInfrastructureInfo: alertPolicyPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        environment: e,
        project: projectName,
      }))))
