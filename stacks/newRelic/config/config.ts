import { Config, Output, StackReference } from "@pulumi/pulumi"
import { Projects } from "../../userConfig"
import { Environments } from "../../../utility/Environments"
import { newrelicAccountName, newrelicAccount } from "../config/provider"
import { adoptAPetConfigs } from "./adopt-a-pet"
import { goodFriendConfigs } from "./goodfriend"
import { kinshipConfigs } from "./kinship"
import { vetinsightConfigs } from "./vetinsight"
import { petExecConfigs } from "./petexec"
import { wisdomPanelConfigs } from "./wisdompanel"
import { alertChannels } from "../resources/alertChannels"
import { alertCondition } from "../resources/alertConditions"
import { alertPolicy } from "../resources/policies"
import { pagerDutyServiceIntKeyOutput } from "../../monitoringConfig"
import { notificationDestinations } from "../resources/notificationDestinations"
import { notificationChannels } from "../resources/notificationChannels"
import { workflows } from "../resources/workflows"

export const emailAlertChannels = [
  "emailChannel",
] as const
export const slackAlertChannels = [
  "slackChannelInfo",
  "slackChannelCritical",
] as const
export const pagerDutyAlertChannels = [
  "info",
  "critical",
] as const
export const platformInfrastructurePolicyTypes = [
  "info",
  "critical",
] as const
export type emailAlertChannel = typeof emailAlertChannels[number]
export type slackAlertChannel = typeof slackAlertChannels[number]
export type pagerDutyAlertChannel = typeof pagerDutyAlertChannels[number]
export type platformInfrastructurePolicyType = typeof platformInfrastructurePolicyTypes[number]
export const platformInfrastructureConditions = [
  "podsMissingAlertCondition",
  "containerDiskFullAlertCondition",
  "podIsNotReadyAlertCondition",
  "podNotScheduledAlertCondition",
  "containerHighMemoryAlertCondition",
  "containerHighCPUAlertCondition",
] as const
export type platformInfrastructureConditions = typeof platformInfrastructureConditions[number]
type slackAlertConf = { [key in slackAlertChannel]: boolean }
type emailAlertConf = { recipients: Array<string> }
type pagerDutyAlertConf = { [key in pagerDutyAlertChannel]: boolean }
type platformInfrastructureAlertConditionThreshHold = {
  value: number,
  duration: number,
  timeFunction: "all" | "any",
}
type platformInfrastructureAlertConditionThreshHolds = {
  critical?: platformInfrastructureAlertConditionThreshHold,
  warning?: platformInfrastructureAlertConditionThreshHold,
}
type platformInfrastructureConf = { [key in platformInfrastructureConditions]?: {
  policyType: platformInfrastructurePolicyType,
  thresholds: platformInfrastructureAlertConditionThreshHolds
} }
export const projectEnvironments: Array<Environments> = ["dev", "production", "staging"]
export type projectEnvironment = {
  slackAlertChannels?: slackAlertConf
  emailAlertChannel?: emailAlertConf
  pagerDutyAlertChannels?: pagerDutyAlertConf
  platformInfrastructureConditions?: platformInfrastructureConf
  runbookUrl?: string
  clusterName?: string
  containerName?: string
}
export type slackProjectChannel = {
  info?: string
  critical?: string
}
export type projectConfiguration = {
  projectName: Projects
  newrelicAccountName: newrelicAccount
  environments: {
    [key in Environments]?: projectEnvironment
  }
}
export type alertResourceRequired = {
  environment: Environments,
  project: Projects,
}
export type alertResourceOutput<T> = Omit<T, "environment" | "project">

export const flattenAlertReturn = <T>(arrOfArr: Array<Array<T>>): Array<T> => {
  return arrOfArr.reduce((accum, arr) => {
    return [...accum, ...arr]
  }, [])
}

export type newrelicChannelIdOutput = {
  id: Output<string>,
  name: string,
  project: Projects
  environment: Environments
}
type alertResourceOutputType = alertChannels | alertPolicy | alertCondition | notificationDestinations | notificationChannels | workflows
export const exportAlertResource = <T extends alertResourceOutputType>(alertArr: Array<T>): Array<newrelicChannelIdOutput> => {
  return alertArr
    .map((a) => Object.keys(a).filter((d) => d != "project" && d != "environment")
      .map((k) =>
      ({
        environment: a.environment,
        id: (a as unknown as any)[k]?.id,
        name: k,
        project: a.project,
      })))
    .reduce((accum, arr) => {
      return [...accum, ...arr]
    }, [])
}

const pagerDutyStackReference = new StackReference("pagerduty")
export const pagerDutyCriticalNewRelicIntKeys = pagerDutyStackReference.getOutput("criticalServiceNewRelicIntKeys")
  .apply((pd) => (pd as Array<pagerDutyServiceIntKeyOutput>).filter((k) => k.key && k.name))
export const pagerDutyInfoNewRelicIntKeys = pagerDutyStackReference.getOutput("infoServiceNewRelicIntKeys")
  .apply((pd) => (pd as Array<pagerDutyServiceIntKeyOutput>).filter((k) => k.key && k.name))

export const slackMonitorStackReference = new StackReference("slackmonitor")
export const slackDevOpsWebhook = (new Config()).requireSecret("slackDevOpsWebhook")

export const projectConfigs: Array<projectConfiguration> =
  newrelicAccountName == "Adopt-a-Pet"
    ? adoptAPetConfigs()
      : newrelicAccountName == "GoodFriend"
      ? goodFriendConfigs()
        : newrelicAccountName == "Kinship.co"
          ? kinshipConfigs()
          : newrelicAccountName == "VetInsight"
            ? vetinsightConfigs()
            : newrelicAccountName == "PetExec"
              ? petExecConfigs()
              : newrelicAccountName == "WisdomPanel"
                ? wisdomPanelConfigs()
                : ([{} as projectConfiguration])
