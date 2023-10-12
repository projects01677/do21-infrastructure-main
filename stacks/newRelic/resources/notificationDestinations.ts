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
import { newrelicWhistleAccountId, provider } from "../config/provider"
export type notificationDestinations = {
  slackDestinationInfo?: newrelic.NotificationDestination,
  slackDestinationCritical?: newrelic.NotificationDestination,
  emailDestination?: newrelic.NotificationDestination,
  pagerDutyDestinationInfo?: Output<newrelic.NotificationDestination>,
  pagerDutyDestinationCritical?: Output<newrelic.NotificationDestination>,
  slackDestinationPlatformInfrastructureInfo?: newrelic.NotificationDestination,
  slackDestinationPlatformInfrastructureCritical?: newrelic.NotificationDestination,
  pagerDutyDestinationPlatformInfrastructureInfo?: Output<newrelic.NotificationDestination>,
  pagerDutyDestinationPlatformInfrastructureCritical?: Output<newrelic.NotificationDestination>,
} & alertResourceRequired

type getSlackDestinationsOutRet = Omit<slackChannelOut, "channelMembers" | "team"> & { slackDevOpsWebhook: Output<string> }

const getSlackDestinationsOut = ({ project, type }: { project: SlackMonitoringProjects, type: slackChannelType }): Output<getSlackDestinationsOutRet> | undefined => slackMonitorStackReference.getOutput("slackChannelsOut")
  .apply((s) => (s as Array<slackChannelOut>)
    .filter((sf) => sf.project == project && sf.type == type)
    .map((sm) => ({
      project: sm.project,
      type: sm.type,
      channelName: sm.channelName,
      channelId: sm.channelId,
      slackDevOpsWebhook: slackDevOpsWebhook
    }))[0])

const slackDestinationInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationDestination | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackDestinationsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook &&
    getSlackDestinationsOut({ project: projectName, type: "info" })?.channelName
    ? new newrelic.NotificationDestination(
      `${projectName}-${e}-slackChannelInfo`,
      {
        name: `Informational Slack Notification Destination - ${projectName}-${e}`,
        type: "SLACK_LEGACY",
        accountId: newrelicWhistleAccountId,
        active: true,
        properties: [
          {
            displayValue: `Informational Slack Notification Destination - ${projectName}-${e}`,
            key: 'url',
            value: getSlackDestinationsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook!,
          },
          {
            key: 'teamChannel',
            value: getSlackDestinationsOut({ project: projectName, type: "info" })?.channelName!.apply((c) => `#${c}`)!,
          },
        ]
      },
      { provider: provider }
    )
    : undefined

const slackDestinationCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationDestination | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackDestinationsOut({ project: projectName, type: "critical" })?.slackDevOpsWebhook &&
    getSlackDestinationsOut({ project: projectName, type: "critical" })?.channelName
    ? new newrelic.NotificationDestination(
      `${projectName}-${e}-slackChannelCritical`,
      {
        name: `Critical Slack Notification Destination - ${projectName}-${e}`,
        type: "SLACK_LEGACY",
        accountId: newrelicWhistleAccountId,
        active: true,
        properties: [
          {
            displayValue: `Critical Slack Notification Destination - ${projectName}-${e}`,
            key: 'url',
            value: getSlackDestinationsOut({ project: projectName, type: "critical" })?.slackDevOpsWebhook!,
          },
          {
            key: 'teamChannel',
            value: getSlackDestinationsOut({ project: projectName, type: "critical" })?.channelName!.apply((c) => `#${c}`)!,
          },
        ]
      },
      { provider: provider }
    )
    : undefined

const emailDestination = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationDestination | undefined =>
  projectEnv?.emailAlertChannel?.recipients.length
    ? new newrelic.NotificationDestination(
      `${projectName}-${e}-emailDestination`,
      {
        name: `Email Notification Destination - ${projectName}-${e}`,
        type: "EMAIL",
        accountId: newrelicWhistleAccountId,
        active: true,
        properties: [
          {
            displayValue: `Email Notification Destination - ${projectName}-${e}`,
            key: 'email',
            value: projectEnv?.emailAlertChannel?.recipients.join(","),
          },
        ],
      },
      { provider: provider }
    )
    : undefined

const pagerDutyDestinationInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationDestination> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.NotificationDestination(
          `${project}-${e}-PagerDutyInfo`,
          {
            name: `Informational PagerDuty Destination - ${project}-${e}`,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            accountId: newrelicWhistleAccountId,
            active: true,
            authToken: {
              token: key,
              prefix: "Token token="
            },
            properties: [
              {
                key: "",
                value: ""
              }
            ],
          },
          { provider: provider })
      )[0])
    : undefined

const pagerDutyDestinationCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationDestination> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.critical
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.NotificationDestination(
          `${project}-${e}-PagerDutyCritical`,
          {
            name: `Critical PagerDuty Destination - ${project}-${e}`,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            accountId: newrelicWhistleAccountId,
            active: true,
            authToken: {
              token: key,
              prefix: "Token token="
            },
            properties: [
              {
                key: "",
                value: ""
              }
            ],
          },
          { provider: provider })
      )[0])
    : undefined

// Platform Infrastructure resources
const slackDestinationPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationDestination | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "info" })?.slackDevOpsWebhook &&
    getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "info" })?.channelName
    ? new newrelic.NotificationDestination(
      `${projectName}-${e}-slackDestinationPlatformInfrastructureInfo`,
      {
        name: `Platform Infrastructure Info Slack Notification Destination - ${projectName}-${e}`,
        type: "SLACK_LEGACY",
        accountId: newrelicWhistleAccountId,
        active: true,
        properties: [
          {
            displayValue: `Platform Infrastructure Info Slack Notification Destination - ${projectName}-${e}`,
            key: 'url',
            value: getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "info" })?.slackDevOpsWebhook!,
          },
          {
            key: 'teamChannel',
            value: getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "info" })?.channelName!.apply((c) => `#${c}`)!,
          },
        ]
      },
      { provider: provider }
    )
    : undefined

const slackDestinationPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationDestination | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.slackDevOpsWebhook &&
    getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.channelName
    ? new newrelic.NotificationDestination(
      `${projectName}-${e}-slackDestinationPlatformInfrastructureCritical`,
      {
        name: `Platform Infrastructure Critical Slack Notification Destination - ${projectName}-${e}`,
        type: "SLACK_LEGACY",
        accountId: newrelicWhistleAccountId,
        active: true,
        properties: [
          {
            displayValue: `Platform Infrastructure Critical Slack Notification Destination - ${projectName}-${e}`,
            key: 'url',
            value: getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.slackDevOpsWebhook!,
          },
          {
            key: 'teamChannel',
            value: getSlackDestinationsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.channelName!.apply((c) => `#${c}`)!,
          },
        ]
      },
      { provider: provider }
    )
    : undefined

const pagerDutyDestinationPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationDestination> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.NotificationDestination(
          `${projectName}-${e}-PagerDutyPlatformInfrastructureInfo`,
          {
            name: `Platform Infrastructure Informational PagerDuty Destination - ${projectName}-${e}`,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            accountId: newrelicWhistleAccountId,
            active: true,
            authToken: {
              token: key,
              prefix: "Token token="
            },
            properties: [
              {
                key: "",
                value: ""
              }
            ],
          },
          { provider: provider })
      )[0])
    : undefined

const pagerDutyDestinationPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationDestination> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.critical
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.NotificationDestination(
          `${projectName}-${e}-PagerDutyPlatformInfrastructureCritical`,
          {
            name: `Platform Infrastructure Critical PagerDuty Destination - ${projectName}-${e}`,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            accountId: newrelicWhistleAccountId,
            active: true,
            authToken: {
              token: key,
              prefix: "Token token="
            },
            properties: [
              {
                key: "",
                value: ""
              }
            ],
          },
          { provider: provider })
      )[0])
    : undefined
export const notificationDestinationsProject: Array<notificationDestinations> =
  flattenAlertReturn<notificationDestinations>(projectEnvironments.map((e) =>
    projectConfigs
      .filter(({ environments }) => environments[e] != undefined)
      .map(({ environments, projectName }): notificationDestinations =>
      ({
        slackDestinationInfo: slackDestinationInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackDestinationCritical: slackDestinationCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyDestinationInfo: pagerDutyDestinationInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyDestinationCritical: pagerDutyDestinationCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        emailDestination: emailDestination({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackDestinationPlatformInfrastructureInfo: slackDestinationPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackDestinationPlatformInfrastructureCritical: slackDestinationPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyDestinationPlatformInfrastructureInfo: pagerDutyDestinationPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyDestinationPlatformInfrastructureCritical: pagerDutyDestinationPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        environment: e,
        project: projectName,
      }))))
