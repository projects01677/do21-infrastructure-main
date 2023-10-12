import * as newrelic from "@pulumi/newrelic"
import { Environments } from "../../../utility/Environments"
import { alertResourceRequired, flattenAlertReturn, platformInfrastructurePolicyType, projectConfigs, projectEnvironment, projectEnvironments } from "../config/config"
import { provider } from "../config/provider"
import { Projects } from "../../userConfig"
import { alertPolicies, alertPolicy, policyName } from "./policies"

export type alertCondition = {
  podsMissingAlertCondition?: newrelic.InfraAlertCondition,
  containerDiskFullAlertCondition?: newrelic.InfraAlertCondition,
  podIsNotReadyAlertCondition?: newrelic.InfraAlertCondition,
  podNotScheduledAlertCondition?: newrelic.InfraAlertCondition,
  containerHighMemoryAlertCondition?: newrelic.InfraAlertCondition,
  containerHighCPUAlertCondition?: newrelic.InfraAlertCondition,
} & alertResourceRequired

const getpolicyType = ({ pt }: { pt: platformInfrastructurePolicyType | undefined }): policyName | undefined => pt == "critical"
  ? "alertPolicyPlatformInfrastructureCritical"
  : pt == "info"
    ? "alertPolicyPlatformInfrastructureInfo"
    : undefined

const getConditionProjectConfig = ({ e, pn }: { e: Environments, pn: Projects }): projectEnvironment | undefined =>
  projectConfigs
    .filter(({ projectName, environments }) => projectName == pn && environments[e] != undefined)
    .map(({ environments }) => environments[e])[0] ?? undefined

const getPolicy = ({ e, pn, apn }: { e: Environments, pn: Projects, apn: policyName }): alertPolicy | undefined =>
  alertPolicies
    .filter((ap) =>
      ap.project == pn &&
      ap.environment == e &&
      ap[apn] != undefined)
    .map((ap) => ap)[0] ?? undefined

/*
ISSUE: getEntity is account wide accountId tag must be specified even though it is
declared in the provider.
      Workaround: https://github.com/newrelic/terraform-provider-newrelic/issues/1041#issuecomment-742741335
*/

const podsMissingAlertCondition = ({ e, pn }:
  {
    e: Environments,
    pn: Projects
  }): newrelic.InfraAlertCondition | undefined => {

  const cc = getConditionProjectConfig({ e: e, pn: pn })
  const ppc = cc?.platformInfrastructureConditions?.podsMissingAlertCondition
  const ppn = getpolicyType({ pt: ppc?.policyType })
  const apn = ppn ? getPolicy({ e: e, pn: pn, apn: ppn }) : undefined
  const wq = `(namespaceName = '${pn}' AND clusterName LIKE '%-${e}%')`
  return (
    (ppc?.thresholds?.critical ||
      ppc?.thresholds?.warning) &&
    apn?.[ppn!]
  ) ? new newrelic.InfraAlertCondition(
    `${pn}-${e}-podsMissing`,
    {
      name: `podsMissing - pi-${pn}-${e}`,
      description: `ReplicaSet does not have desired amount of pods - Platform Infrastructure ${pn}-${e}`,
      runbookUrl: cc?.runbookUrl,
      policyId: apn[ppn!]!.id.apply((id) =>
        parseInt(id)
      ),
      type: "infra_metric",
      event: "K8sReplicasetSample",
      select: "podsMissing",
      comparison: "above",
      violationCloseTimer: 72,
      where: wq,
      ...ppc?.thresholds,
    },
    { provider: provider }
  )
    : undefined
}

const containerDiskFullAlertCondition = ({ e, pn }:
  {
    e: Environments,
    pn: Projects
  }): newrelic.InfraAlertCondition | undefined => {

  const cc = getConditionProjectConfig({ e: e, pn: pn })
  const ppc = cc?.platformInfrastructureConditions?.containerDiskFullAlertCondition
  const ppn = getpolicyType({ pt: ppc?.policyType })
  const apn = ppn ? getPolicy({ e: e, pn: pn, apn: ppn }) : undefined
  const wq = `(namespaceName = '${pn}' AND clusterName LIKE '%-${e}%')`
  return (
    (ppc?.thresholds?.critical ||
      ppc?.thresholds?.warning) &&
    apn?.[ppn!]
  ) ? new newrelic.InfraAlertCondition(
    `${pn}-${e}-containerDiskFull`,
    {
      name: `containerDiskFull - pi-${pn}-${e}`,
      description: `Container is running out of Disk Space - Platform Infrastructure ${pn}-${e}`,
      runbookUrl: cc?.runbookUrl,
      policyId: apn[ppn!]!.id.apply((id) =>
        parseInt(id)
      ),
      type: "infra_metric",
      event: "K8sContainerSample",
      select: "fsUsedPercent",
      comparison: "above",
      violationCloseTimer: 72,
      where: wq,
      ...ppc?.thresholds,
    },
    { provider: provider }
  )
    : undefined
}

const podIsNotReadyAlertCondition = ({ e, pn }:
  {
    e: Environments,
    pn: Projects
  }): newrelic.InfraAlertCondition | undefined => {

  const cc = getConditionProjectConfig({ e: e, pn: pn })
  const ppc = cc?.platformInfrastructureConditions?.podIsNotReadyAlertCondition
  const ppn = getpolicyType({ pt: ppc?.policyType })
  const apn = ppn ? getPolicy({ e: e, pn: pn, apn: ppn }) : undefined
  const wq = `(namespaceName = '${pn}' AND clusterName LIKE '%-${e}%')`
  return (
    (ppc?.thresholds?.critical ||
      ppc?.thresholds?.warning) &&
    apn?.[ppn!]
  ) ? new newrelic.InfraAlertCondition(
    `${pn}-${e}-podIsNotReady`,
    {
      name: `podIsNotReady - pi-${pn}-${e}`,
      description: `Pod is not ready - Platform Infrastructure ${pn}-${e}`,
      runbookUrl: cc?.runbookUrl,
      policyId: apn[ppn!]!.id.apply((id) =>
        parseInt(id)
      ),
      type: "infra_metric",
      event: "K8sPodSample",
      select: "isReady",
      comparison: "equal",
      violationCloseTimer: 72,
      where: wq + `AND ( status != 'Succeeded' ) AND (status != 'Failed')`,
      ...ppc?.thresholds,
    },
    { provider: provider }
  )
    : undefined
}

const podNotScheduledAlertCondition = ({ e, pn }:
  {
    e: Environments,
    pn: Projects
  }): newrelic.InfraAlertCondition | undefined => {

  const cc = getConditionProjectConfig({ e: e, pn: pn })
  const ppc = cc?.platformInfrastructureConditions?.podNotScheduledAlertCondition
  const ppn = getpolicyType({ pt: ppc?.policyType })
  const apn = ppn ? getPolicy({ e: e, pn: pn, apn: ppn }) : undefined
  const wq = `(namespaceName = '${pn}' AND clusterName LIKE '%-${e}%')`
  return (
    (ppc?.thresholds?.critical ||
      ppc?.thresholds?.warning) &&
    apn?.[ppn!]
  ) ? new newrelic.InfraAlertCondition(
    `${pn}-${e}-podNotScheduled`,
    {
      name: `podNotScheduled - pi-${pn}-${e}`,
      description: `Pod was unable to be scheduled - Platform Infrastructure ${pn}-${e}`,
      runbookUrl: cc?.runbookUrl,
      policyId: apn[ppn!]!.id.apply((id) =>
        parseInt(id)
      ),
      type: "infra_metric",
      event: "K8sPodSample",
      select: "isScheduled",
      comparison: "equal",
      violationCloseTimer: 72,
      where: wq,
      ...ppc?.thresholds,
    },
    { provider: provider }
  )
    : undefined
}

const containerHighMemoryAlertCondition = ({ e, pn }:
  {
    e: Environments,
    pn: Projects
  }): newrelic.InfraAlertCondition | undefined => {

  const cc = getConditionProjectConfig({ e: e, pn: pn })
  const ppc = cc?.platformInfrastructureConditions?.containerHighMemoryAlertCondition
  const ppn = getpolicyType({ pt: ppc?.policyType })
  const apn = ppn ? getPolicy({ e: e, pn: pn, apn: ppn }) : undefined
  const wq = `(namespaceName = '${pn}' AND clusterName LIKE '%-${e}%')`
  return (
    (ppc?.thresholds?.critical ||
      ppc?.thresholds?.warning) &&
    apn?.[ppn!]
  ) ? new newrelic.InfraAlertCondition(
    `${pn}-${e}-containerHighMemory`,
    {
      name: `containerHighMemory - pi-${pn}-${e}`,
      description: `Container Memory Usage % is too high - Platform Infrastructure ${pn}-${e}`,
      runbookUrl: cc?.runbookUrl,
      policyId: apn[ppn!]!.id.apply((id) =>
        parseInt(id)
      ),
      type: "infra_metric",
      event: "K8sContainerSample",
      select: "memoryWorkingSetUtilization",
      comparison: "above",
      violationCloseTimer: 72,
      where: wq,
      ...ppc?.thresholds,
    },
    { provider: provider }
  )
    : undefined
}

const containerHighCPUAlertCondition = ({ e, pn }:
  {
    e: Environments,
    pn: Projects
  }): newrelic.InfraAlertCondition | undefined => {

  const cc = getConditionProjectConfig({ e: e, pn: pn })
  const ppc = cc?.platformInfrastructureConditions?.containerHighCPUAlertCondition
  const ppn = getpolicyType({ pt: ppc?.policyType })
  const apn = ppn ? getPolicy({ e: e, pn: pn, apn: ppn }) : undefined
  const wq = `(namespaceName = '${pn}' AND clusterName LIKE '%-${e}%')`
  return (
    (ppc?.thresholds?.critical ||
      ppc?.thresholds?.warning) &&
    apn?.[ppn!]
  ) ? new newrelic.InfraAlertCondition(
    `${pn}-${e}-containerHighCPU`,
    {
      name: `containerHighCPU - pi-${pn}-${e}`,
      description: `Container CPU Usage % is too high - Platform Infrastructure ${pn}-${e}`,
      runbookUrl: cc?.runbookUrl,
      policyId: apn[ppn!]!.id.apply((id) =>
        parseInt(id)
      ),
      type: "infra_metric",
      event: "K8sContainerSample",
      select: "cpuCoresUtilization",
      comparison: "above",
      violationCloseTimer: 72,
      where: wq,
      ...ppc?.thresholds,
    },
    { provider: provider }
  )
    : undefined
}

export const alertConditions: Array<alertCondition> =
  flattenAlertReturn<alertCondition>(projectEnvironments.map((e) =>
    alertPolicies
      .map((ap) => ap)
      .filter((ap) =>
        e == ap.environment)
      .map((ap): alertCondition =>
      ({
        podsMissingAlertCondition: podsMissingAlertCondition({ e: e, pn: ap.project }),
        containerDiskFullAlertCondition: containerDiskFullAlertCondition({ e: e, pn: ap.project }),
        podIsNotReadyAlertCondition: podIsNotReadyAlertCondition({ e: e, pn: ap.project }),
        podNotScheduledAlertCondition: podNotScheduledAlertCondition({ e: e, pn: ap.project }),
        containerHighMemoryAlertCondition: containerHighMemoryAlertCondition({ e: e, pn: ap.project }),
        containerHighCPUAlertCondition: containerHighCPUAlertCondition({ e: e, pn: ap.project }),
        environment: e,
        project: ap.project,
      }))))
