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
import { notificationDestinationsProject } from "./notificationDestinations"
export type notificationChannels = {
  slackChannelInfo?: newrelic.NotificationChannel,
  slackChannelCritical?: newrelic.NotificationChannel,
  emailChannel?: newrelic.NotificationChannel,
  pagerDutyChannelInfo?: Output<newrelic.NotificationChannel>,
  pagerDutyChannelCritical?: Output<newrelic.NotificationChannel>,
  slackChannelPlatformInfrastructureInfo?: newrelic.NotificationChannel,
  slackChannelPlatformInfrastructureCritical?: newrelic.NotificationChannel,
  pagerDutyChannelPlatformInfrastructureInfo?: Output<newrelic.NotificationChannel>,
  pagerDutyChannelPlatformInfrastructureCritical?: Output<newrelic.NotificationChannel>,
} & alertResourceRequired
export type notificationChannelName = keyof Omit<notificationChannels, keyof alertResourceRequired>
const pagerDutyServiceIntCustomDetails = '{\n    {{#if nrAccountId}}"account_id": {{nrAccountId}},{{/if}}\n    "account_name": {{json accumulations.tag.account.[0]}},\n    {{#if accumulations.tag.action}}"action":{{json accumulations.tag.action.[0]}},{{/if}}\n    "closed_violations_count": {\n        "critical": {{#if closedIncidentsCount}}{{closedIncidentsCount}}{{else}}0{{/if}},\n        "warning": 0,\n        "total": {{#if closedIncidentsCount}}{{closedIncidentsCount}}{{else}}0{{/if}}\n    },\n    "condition_family_id": {{accumulations.conditionFamilyId.[0]}},\n    "condition_id": {{accumulations.conditionFamilyId.[0]}},\n    "condition_name": {{json accumulations.conditionName.[0]}},\n    {{#if accumulations.evaluationName}}"condition_metric_name": {{json accumulations.evaluationName.[0]}},{{/if}}\n    {{#if accumulations.evaluationMetricValueFunction}}"condition_metric_value_function": {{json accumulations.evaluationMetricValueFunction.[0]}},{{/if}}\n    "current_state": {{#if issueClosedAt}}"closed"{{else if issueAcknowledgedAt}}"acknowledged"{{else}}"open"{{/if}},\n    "details": {{json issueTitle}},\n    "duration": {{#if issueDurationMs}}{{issueDurationMs}}{{else}}0{{/if}},\n    "event_type": "INCIDENT",\n    "incident_acknowledge_url": {{json issueAckUrl}},\n    {{#if labels.nrIncidentId}}"incident_id": {{labels.nrIncidentId.[0]}},{{/if}}\n    "incident_url": {{json issuePageUrl}},\n    "issue_id": {{json issueId}},\n    "metadata": {\n        {{#if locationStatusesObject}}"location_statuses": {{locationStatusesObject}},{{/if}}\n        {{#if accumulations.metadata_entity_type}}"entity.type": {{json accumulations.metadata_entity_type.[0]}},{{/if}}\n        {{#if accumulations.metadata_entity_name}}"entity.name": {{json accumulations.metadata_entity_name.[0]}}{{/if}}\n    },\n    "open_violations_count": {\n        "critical": {{#if openIncidentsCount}}{{openIncidentsCount}}{{else}}0{{/if}},\n        "warning": 0,\n        "total": {{#if openIncidentsCount}}{{openIncidentsCount}}{{else}}0{{/if}}\n    },\n    "policy_name": {{json accumulations.policyName.[0]}},\n    {{#if policyUrl}}"policy_url": {{json policyUrl}},{{/if}}\n    "radar_entity": {\n        "accountId": {{json accumulations.tag.accountId.[0]}},\n        "domain": {{json accumulations.conditionProduct.[0]}},\n        "domainId": {{json issueId}},\n        "entityGuid": {{json entitiesData.entities.[0].id}},\n        "name": {{#if accumulations.targetName}}{{json accumulations.targetName.[0]}}{{else if entitiesData.entities}}{{json entitiesData.entities.[0].name}}{{else}}"NA"{{/if}},\n        "type": {{#if entitiesData.types.[0]}}{{json entitiesData.types.[0]}}{{else}}"NA"{{/if}}\n    },\n    {{#if accumulations.runbookUrl}}"runbook_url": {{json accumulations.runbookUrl.[0]}},{{/if}}\n    "severity": {{#eq HIGH priority}}"WARNING"{{else}}{{json priority}}{{/eq}},\n    "state": {{json state}},\n    "status": {{json status}},\n    "targets": [\n        {\n            "id": {{json entitiesData.entities.[0].id}},\n            "name": {{#if accumulations.targetName}}{{json accumulations.targetName.[0]}}{{else if entitiesData.entities}}{{json entitiesData.entities.[0].name}}{{else}}"NA"{{/if}},\n            "link": {{json issuePageUrl}},\n            "product": {{json accumulations.conditionProduct.[0]}},\n            "type": {{#if entitiesData.types.[0]}}{{json entitiesData.types.[0]}}{{else}}"NA"{{/if}},\n            "labels": {\n                {{#each accumulations.tag}}{{#if this.[0]}}"{{@key}}":{{json this.[0]}}{{#unless @last}},{{/unless}}{{/if}}{{/each}}\n            }\n        }\n    ],\n    "timestamp": {{#if closedAt}}{{closedAt}}{{else if acknowledgedAt}}{{acknowledgedAt}}{{else}}{{createdAt}}{{/if}},\n    "timestamp_utc_string": {{#if issueClosedAtUtc}}{{json issueClosedAtUtc}}{{else if issueAcknowledgedAt}}{{json issueAcknowledgedAt}}{{else}}{{json issueCreatedAtUtc}}{{/if}},\n    "version": "1.0",\n    {{#if accumulations.conditionDescription}}"VIOLATION DESCRIPTION": {{json accumulations.conditionDescription.[0]}},{{/if}}\n    {{#if violationChartUrl}}"violation_chart_url": {{json violationChartUrl}},{{/if}}\n    "violation_callback_url": {{json issuePageUrl}}\n}'
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
type notificationDestination =
  "slackDestinationInfo" |
  "slackDestinationCritical" |
  "emailDestination" |
  "pagerDutyDestinationInfo" |
  "pagerDutyDestinationCritical" |
  "slackDestinationPlatformInfrastructureInfo" |
  "slackDestinationPlatformInfrastructureCritical" |
  "pagerDutyDestinationPlatformInfrastructureInfo" |
  "pagerDutyDestinationPlatformInfrastructureCritical"


const getNotificationDestination = ({ e, pn, dn }: { e: Environments, pn: Projects, dn: notificationDestination }): Output<string> | undefined =>
  notificationDestinationsProject
    .filter((nc) =>
      nc.project == pn &&
      nc.environment == e &&
      nc[dn]?.id.apply((i) => i))
    .map((nd) => nd)[0][dn]?.id.apply((id) => id) ?? undefined

const slackChannelInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.channelName &&
    getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationInfo" })
    ? new newrelic.NotificationChannel(
      `${projectName}-${e}-slackChannelInfo`,
      {
        name: `Informational Slack Notification Channel - ${projectName}-${e}`,
        product: 'IINT',
        accountId: newrelicWhistleAccountId,
        active: true,
        type: "SLACK_LEGACY",
        destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationInfo" })!,
        properties: [
          {
            key: "",
            value: ""
          }
        ],
      },
      { provider: provider }
    )
    : undefined

const slackChannelCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.channelName &&
    getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationCritical" })
    ? new newrelic.NotificationChannel(
      `${projectName}-${e}-slackChannelCritical`,
      {
        name: `Critical Slack Notification Channel - ${projectName}-${e}`,
        product: 'IINT',
        accountId: newrelicWhistleAccountId,
        active: true,
        type: "SLACK_LEGACY",
        destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationCritical" })!,
        properties: [
          {
            key: "",
            value: ""
          }
        ],
      },
      { provider: provider }
    )
    : undefined

const emailChannel = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationChannel | undefined =>
  projectEnv?.emailAlertChannel?.recipients.length &&
    getNotificationDestination({ e: e, pn: projectName, dn: "emailDestination" })
    ? new newrelic.NotificationChannel(
      `${projectName}-${e}-emailChannel`,
      {
        name: `Email Alert Channel - ${projectName}-${e}`,
        product: 'IINT',
        accountId: newrelicWhistleAccountId,
        active: true,
        type: "EMAIL",
        destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "emailDestination" })!,
        properties: [
          {
            key: 'subject',
            value: '{{ issueTitle }} - Issue {{issueId}}\n',
          }
        ]
      },
      { provider: provider }
    )
    : undefined

const pagerDutyChannelInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info &&
    getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationInfo" })
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.NotificationChannel(
          `${project}-${e}-PagerDutyInfo`,
          {
            name: `Informational PagerDuty Channel - ${project}-${e}`,
            product: 'IINT',
            accountId: newrelicWhistleAccountId,
            active: true,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationInfo" })!,
            properties: [
              {
                key: 'summary',
                value: '{{ annotations.title.[0] }}',
              },
              {
                key: 'customDetails',
                value: pagerDutyServiceIntCustomDetails
              }
            ]
          },
          { provider: provider })
      )[0])
    : undefined

const pagerDutyChannelCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info &&
    getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationCritical" })
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.NotificationChannel(
          `${project}-${e}-PagerDutyCritical`,
          {
            name: `Critical PagerDuty Channel - ${project}-${e}`,
            product: 'IINT',
            accountId: newrelicWhistleAccountId,
            active: true,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationCritical" })!,
            properties: [
              {
                key: 'summary',
                value: '{{ annotations.title.[0] }}',
              },
              {
                key: 'customDetails',
                value: pagerDutyServiceIntCustomDetails
              }
            ]
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
  }): newrelic.NotificationChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.channelName &&
    getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationPlatformInfrastructureInfo" })
    ? new newrelic.NotificationChannel(
      `${projectName}-${e}-slackChannelPlatformInfrastructureInfo`,
      {
        name: `Platform Infrastructure Info Slack Alert Channel - ${projectName}-${e}`,
        product: 'IINT',
        accountId: newrelicWhistleAccountId,
        active: true,
        type: "SLACK_LEGACY",
        destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationPlatformInfrastructureInfo" })!,
        properties: [
          {
            key: "",
            value: ""
          }
        ],
      },
      { provider: provider }
    )
    : undefined

const slackChannelPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.NotificationChannel | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "critical" })?.channelName &&
    getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationPlatformInfrastructureCritical" })
    ? new newrelic.NotificationChannel(
      `${projectName}-${e}-slackChannelPlatformInfrastructureCritical`,
      {
        name: `Platform Infrastructure Critical Slack Alert Channel - ${projectName}-${e}`,
        product: 'IINT',
        accountId: newrelicWhistleAccountId,
        active: true,
        type: "SLACK_LEGACY",
        destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "slackDestinationPlatformInfrastructureCritical" })!,
        properties: [
          {
            key: "",
            value: ""
          }
        ],
      },
      { provider: provider }
    )
    : undefined

const pagerDutyChannelPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info &&
    getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationPlatformInfrastructureInfo" })
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.NotificationChannel(
          `${projectName}-${e}-PagerDutyPlatformInfrastructureInfo`,
          {
            name: `Platform Infrastructure Informational PagerDuty Channel - ${projectName}-${e}`,
            product: 'IINT',
            accountId: newrelicWhistleAccountId,
            active: true,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationPlatformInfrastructureInfo" })!,
            properties: [
              {
                key: 'summary',
                value: '{{ annotations.title.[0] }}',
              },
              {
                key: 'customDetails',
                value: pagerDutyServiceIntCustomDetails
              }
            ]
          },
          { provider: provider })
      )[0])
    : undefined

const pagerDutyChannelPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.NotificationChannel> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.critical &&
    getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationPlatformInfrastructureCritical" })
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.NotificationChannel(
          `${projectName}-${e}-PagerDutyPlatformInfrastructureCritical`,
          {
            name: `Platform Infrastructure Critical PagerDuty Channel - ${projectName}-${e}`,
            product: 'IINT',
            accountId: newrelicWhistleAccountId,
            active: true,
            type: "PAGERDUTY_SERVICE_INTEGRATION",
            destinationId: getNotificationDestination({ e: e, pn: projectName, dn: "pagerDutyDestinationPlatformInfrastructureCritical" })!,
            properties: [
              {
                key: 'summary',
                value: '{{ annotations.title.[0] }}',
              },
              {
                key: 'customDetails',
                value: pagerDutyServiceIntCustomDetails
              }
            ]
          },
          { provider: provider })
      )[0])
    : undefined

export const notificationChannelsProject: Array<notificationChannels> =
  flattenAlertReturn<notificationChannels>(projectEnvironments.map((e) =>
    projectConfigs
      .filter(({ environments }) => environments[e] != undefined)
      .map(({ environments, projectName }): notificationChannels =>
      ({
        slackChannelInfo: slackChannelInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackChannelCritical: slackChannelCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        emailChannel: emailChannel({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelInfo: pagerDutyChannelInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelCritical: pagerDutyChannelCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackChannelPlatformInfrastructureInfo: slackChannelPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackChannelPlatformInfrastructureCritical: slackChannelPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelPlatformInfrastructureInfo: pagerDutyChannelPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyChannelPlatformInfrastructureCritical: pagerDutyChannelPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        environment: e,
        project: projectName,
      }))))
