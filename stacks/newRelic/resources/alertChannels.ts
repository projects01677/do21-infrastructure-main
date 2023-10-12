import * as newrelic from "@pulumi/newrelic"
import { Output } from "@pulumi/pulumi"
import { Environments } from "../../../utility/Environments"
import { slackChannelOut, slackChannelType, slackMonitoringPlatformProject, SlackMonitoringProjects } from "../../monitoringConfig"
import { Projects } from "../../userConfig"

import {
  projectEnvironments,
  projectEnvironment,
  projectConfigs,
  flattenAlertReturn,
  alertResourceRequired,
  pagerDutyCriticalNewRelicIntKeys,
  pagerDutyInfoNewRelicIntKeys,
  slackMonitorStackReference,
  slackDevOpsWebhook
} from "../config/config"
import { provider } from "../config/provider"
export type alertChannels = {
  slackChannelInfo?: newrelic.AlertChannel,
  slackChannelCritical?: newrelic.AlertChannel,
  emailChannel?: newrelic.AlertChannel,
  pagerDutyChannelInfo?: Output<newrelic.AlertChannel>,
  pagerDutyChannelCritical?: Output<newrelic.AlertChannel>,
  slackChannelPlatformInfrastructureInfo?: newrelic.AlertChannel,
  slackChannelPlatformInfrastructureCritical?: newrelic.AlertChannel,
  pagerDutyChannelPlatformInfrastructureInfo?: Output<newrelic.AlertChannel>,
  pagerDutyChannelPlatformInfrastructureCritical?: Output<newrelic.AlertChannel>,
} & alertResourceRequired

type getSlackChannelsOutRet = Omit<slackChannelOut, "channelMembers" | "team"> & { slackDevOpsWebhook: Output<string> }

const getSlackChannelsOut = ({ project, type }: { project: SlackMonitoringProjects, type: slackChannelType }): Output<getSlackChannelsOutRet> | undefined => slackMonitorStackReference.getOutput("slackChannelsOut")
  .apply((s) => (s as Array<slackChannelOut>)
    .filter((sf) => sf.project == project && sf.type == type)
    .map((sm) => ({
      project: sm.project,
      type: sm.type,
      channelName: sm.channelName,
      channelId: sm.channelId,
      slackDevOpsWebhook: slackDevOpsWebhook
    }))[0])

const slackChannelInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.channelName
    ? new newrelic.AlertChannel(
      `${projectName}-${e}-slackChannelInfo`,
      {
        name: `Informational Slack Alert Channel - ${projectName}-${e}`,
        type: "slack",
        config: {
          channel: getSlackChannelsOut({ project: projectName, type: "info" })?.channelName,
          url: getSlackChannelsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook,
        },
      },
      { provider: provider }
    )
    : undefined

const slackChannelCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackChannelsOut({ project: projectName, type: "critical" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: projectName, type: "critical" })?.channelName
    ? new newrelic.AlertChannel(
      `${projectName}-${e}-slackChannelCritical`,
      {
        name: `Critical Slack Alert Channel - ${projectName}-${e}`,
        type: "slack",
        config: {
          channel: getSlackChannelsOut({ project: projectName, type: "critical" })?.channelName,
          url: getSlackChannelsOut({ project: projectName, type: "critical" })?.slackDevOpsWebhook,
        },
      },
      { provider: provider }
    )
    : undefined

const emailChannel = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertChannel | undefined =>
  projectEnv?.emailAlertChannel?.recipients.length
    ? new newrelic.AlertChannel(
      `${projectName}-${e}-emailChannel`,
      {
        name: `Email Alert Channel - ${projectName}-${e}`,
        type: "email",
        config: {
          recipients: projectEnv?.emailAlertChannel?.recipients.join(","),
          includeJsonAttachment: "1",
        },
      },
      { provider: provider }
    )
    : undefined

const pagerDutyChannelInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.AlertChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.AlertChannel(
          `${project}-${e}-PagerDutyInfo`,
          {
            name: `Informational PagerDuty Channel - ${project}-${e}`,
            type: "pagerduty",
            config: {
              serviceKey: key
            },
          },
          { provider: provider })
      )[0])
    : undefined

const pagerDutyChannelCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.AlertChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.critical
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.AlertChannel(
          `${project}-${e}-PagerDutyCritical`,
          {
            name: `Critical PagerDuty Channel - ${project}-${e}`,
            type: "pagerduty",
            config: {
              serviceKey: key
            },
          },
          { provider: provider })
      )[0])
    : undefined

// Platform Infrastructure resources
const slackChannelPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.channelName
    ? new newrelic.AlertChannel(
      `${projectName}-${e}-slackChannelPlatformInfrastructureInfo`,
      {
        name: `Platform Infrastructure Info Slack Alert Channel - ${projectName}-${e}`,
        type: "slack",
        config: {
          channel: getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.channelName,
          url: getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.slackDevOpsWebhook,
        },
      },
      { provider: provider }
    )
    : undefined

const slackChannelPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.AlertChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.channelName
    ? new newrelic.AlertChannel(
      `${projectName}-${e}-slackChannelPlatformInfrastructureCritical`,
      {
        name: `Platform Infrastructure Critical Slack Alert Channel - ${projectName}-${e}`,
        type: "slack",
        config: {
          channel: getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.channelName,
          url: getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.slackDevOpsWebhook,
        },
      },
      { provider: provider }
    )
    : undefined

const pagerDutyChannelPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.AlertChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.AlertChannel(
          `${projectName}-${e}-PagerDutyPlatformInfrastructureInfo`,
          {
            name: `Platform Infrastructure Informational PagerDuty Channel - ${projectName}-${e}`,
            type: "pagerduty",
            config: {
              serviceKey: key
            },
          },
          { provider: provider })
      )[0])
    : undefined

const pagerDutyChannelPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.AlertChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.critical
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.AlertChannel(
          `${projectName}-${e}-PagerDutyPlatformInfrastructureCritical`,
          {
            name: `Platform Infrastructure Critical PagerDuty Channel - ${projectName}-${e}`,
            type: "pagerduty",
            config: {
              serviceKey: key
            },
          },
          { provider: provider })
      )[0])
    : undefined
export const alertChannelsProject: Array<alertChannels> =
  flattenAlertReturn<alertChannels>(projectEnvironments.map((e) =>
    projectConfigs
      .filter(({ environments }) => environments[e] != undefined)
      .map(({ environments, projectName }): alertChannels =>
      ({
        slackChannelInfo: slackChannelInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackChannelCritical: slackChannelCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelInfo: pagerDutyChannelInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelCritical: pagerDutyChannelCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        emailChannel: emailChannel({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackChannelPlatformInfrastructureInfo: slackChannelPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackChannelPlatformInfrastructureCritical: slackChannelPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelPlatformInfrastructureInfo: pagerDutyChannelPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelPlatformInfrastructureCritical: pagerDutyChannelPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        environment: e,
        project: projectName,
      }))))
