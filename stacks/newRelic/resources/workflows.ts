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
import { newrelicWhistleAccountId, provider, newrelicAccountId } from "../config/provider"
import { notificationChannelName, notificationChannelsProject } from "./notificationChannels"
import { alertPolicies, policyName } from "./policies"
export type workflows = {
  slackWorkflowInfo?: newrelic.Workflow,
  slackWorkflowCritical?: newrelic.Workflow,
  emailWorkflow?: newrelic.Workflow,
  pagerDutyWorkflowInfo?: Output<newrelic.Workflow>,
  pagerDutyWorkflowCritical?: Output<newrelic.Workflow>,
  slackWorkflowPlatformInfrastructureInfo?: newrelic.Workflow,
  slackWorkflowPlatformInfrastructureCritical?: newrelic.Workflow,
  pagerDutyWorkflowPlatformInfrastructureInfo?: Output<newrelic.Workflow>,
  pagerDutyWorkflowPlatformInfrastructureCritical?: Output<newrelic.Workflow>,
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

const getNotificationChannel = ({ e, pn, dn }: { e: Environments, pn: Projects, dn: notificationChannelName }): Output<string> | undefined =>
  notificationChannelsProject
    .filter((nc) =>
      nc.project == pn &&
      nc.environment == e &&
      nc[dn]?.id.apply((i) => i))
    .map((nd) => nd)[0][dn]?.id.apply((id) => id) ?? undefined

const getPolicyId = ({ env, proj, policyName }: { env: Environments, proj: Projects, policyName: policyName }): Output<string> | undefined =>
  alertPolicies
    .filter((ap) =>
      ap.project == proj &&
      ap.environment == env &&
      ap[policyName]?.id.apply((i) => i))
    .map((p) => p)[0][policyName]?.id.apply((id) => id) ?? undefined

const slackWorkflowInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.Workflow | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.channelName &&
    getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelInfo" })
    ? new newrelic.Workflow(
      `${projectName}-${e}-slackWorkflowInfo`,
      {
        name: `Informational Slack Workflow - ${projectName}-${e}`,
        accountId: newrelicWhistleAccountId,
        enabled: true,
        destinationsEnabled: true,
        destinations: [{
          channelId: getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelInfo" })!
        }],
        mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES', enrichmentsEnabled: true,
        enrichments: { nrqls: [] },
        issuesFilter: {
          name: `${projectName}-${e}-slackWorkflowInfo-issue-filter`,
          type: 'FILTER',
          predicates: [
            {
              attribute: 'labels.policyIds',
              operator: 'EXACTLY_MATCHES',
              values: [
                getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyInfo" })!.apply((id) => id)
              ],
            },
            {
              attribute: 'priority',
              operator: 'EQUAL',
              values: [
                'CRITICAL',
              ],
            },
          ]
        }
      },
      { provider: provider }
    )
    : undefined

const slackWorkflowCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.Workflow | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: projectName, type: "info" })?.channelName &&
    getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelCritical" })
    ? new newrelic.Workflow(
      `${projectName}-${e}-slackWorkflowCritical`,
      {
        name: `Critical Slack Workflow - ${projectName}-${e}`,
        accountId: newrelicWhistleAccountId,
        enabled: true,
        destinationsEnabled: true,
        destinations: [{
          channelId: getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelCritical" })!
        }],
        mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
        enrichmentsEnabled: true,
        enrichments: { nrqls: [] },
        issuesFilter: {
          name: `${projectName}-${e}-slackWorkflowCritical-issue-filter`,
          type: 'FILTER',
          predicates: [
            {
              attribute: 'labels.policyIds',
              operator: 'EXACTLY_MATCHES',
              values: [
                getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyCritical" })!.apply((id) => id)
              ],
            },
            {
              attribute: 'priority',
              operator: 'EQUAL',
              values: [
                'CRITICAL',
              ],
            },
          ]
        }
      },
      { provider: provider }
    )
    : undefined

const emailWorkflow = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.Workflow | undefined =>
  projectEnv?.emailAlertChannel?.recipients.length &&
    getNotificationChannel({ e: e, pn: projectName, dn: "emailChannel" })
    ? new newrelic.Workflow(
      `${projectName}-${e}-emailWorkflow`,
      {
        name: `Email Workflow - ${projectName}-${e}`,
        accountId: newrelicWhistleAccountId,
        enabled: true,
        destinationsEnabled: true,
        destinations: [{
          channelId: getNotificationChannel({ e: e, pn: projectName, dn: "emailChannel" })!
        }],
        mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
        enrichmentsEnabled: true,
        enrichments: { nrqls: [] },
        issuesFilter: {
          name: `${projectName}-${e}-emailWorkflow-issue-filter`,
          type: 'FILTER',
          predicates: [
            {
              attribute: 'labels.policyIds',
              operator: 'EXACTLY_MATCHES',
              values: [
                getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyCritical" })!.apply((id) => id),
                getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyInfo" })!.apply((id) => id)
              ],
            },
            {
              attribute: 'priority',
              operator: 'EQUAL',
              values: [
                'CRITICAL',
              ],
            },
          ]
        }
      },
      { provider: provider }
    )
    : undefined

const pagerDutyWorkflowInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.Workflow> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info &&
    getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelInfo" })
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.Workflow(
          `${project}-${e}-pagerDutyWorkflowInfo`,
          {
            name: `Informational PagerDuty Workflow - ${project}-${e}`,
            accountId: newrelicWhistleAccountId,
            enabled: true,
            destinationsEnabled: true,
            destinations: [{
              channelId: getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelInfo" })!
            }],
            mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
            enrichmentsEnabled: true,
            enrichments: { nrqls: [] },
            issuesFilter: {
              name: `${projectName}-${e}-pagerDutyWorkflowInfo-issue-filter`,
              type: 'FILTER',
              predicates: [
                {
                  attribute: 'labels.policyIds',
                  operator: 'EXACTLY_MATCHES',
                  values: [
                    getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyInfo" })!.apply((id) => id)
                  ],
                },
                {
                  attribute: 'priority',
                  operator: 'EQUAL',
                  values: [
                    'CRITICAL',
                  ],
                },
              ]
            }
          },
          { provider: provider }
        )
      )[0])
    : undefined

const pagerDutyWorkflowCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.Workflow> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info &&
    getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelCritical" })
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == projectName)
      .map(({ project, key }) =>
        new newrelic.Workflow(
          `${project}-${e}-pagerDutyWorkflowCritical`,
          {
            name: `Critical PagerDuty Workflow - ${project}-${e}`,
            accountId: newrelicWhistleAccountId,
            enabled: true,
            destinationsEnabled: true,
            destinations: [{
              channelId: getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelCritical" })!
            }],
            mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
            enrichmentsEnabled: true,
            enrichments: { nrqls: [] },
            issuesFilter: {
              name: `${projectName}-${e}-pagerDutyWorkflowCritical-issue-filter`,
              type: 'FILTER',
              predicates: [
                {
                  attribute: 'labels.policyIds',
                  operator: 'EXACTLY_MATCHES',
                  values: [
                    getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyCritical" })!.apply((id) => id)
                  ],
                },
                {
                  attribute: 'priority',
                  operator: 'EQUAL',
                  values: [
                    'CRITICAL',
                  ],
                },
              ]
            }
          },
          { provider: provider }
        )
      )[0])
    : undefined

// Platform Infrastructure resources
const slackWorkflowPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.Workflow | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelInfo &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.channelName &&
    getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelPlatformInfrastructureInfo" })
    ? new newrelic.Workflow(
      `${projectName}-${e}-slackWorkflowPlatformInfrastructureInfo`,
      {
        name: `Platform Infrastructure Info Slack Workflow - ${projectName}-${e}`,
        accountId: newrelicWhistleAccountId,
        enabled: true,
        destinationsEnabled: true,
        destinations: [{
          channelId: getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelPlatformInfrastructureInfo" })!
        }],
        mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
        enrichmentsEnabled: true,
        enrichments: { nrqls: [] },
        issuesFilter: {
          name: `${projectName}-${e}-slackWorkflowPlatformInfrastructureInfo-issue-filter`,
          type: 'FILTER',
          predicates: [
            {
              attribute: 'labels.policyIds',
              operator: 'EXACTLY_MATCHES',
              values: [
                getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyPlatformInfrastructureInfo" })!.apply((id) => id)
              ],
            },
            {
              attribute: 'priority',
              operator: 'EQUAL',
              values: [
                'CRITICAL',
              ],
            },
          ]
        }
      },
      { provider: provider }
    )
    : undefined

const slackWorkflowPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): newrelic.Workflow | undefined =>
  projectEnv?.slackAlertChannels?.slackChannelCritical &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.slackDevOpsWebhook &&
    getSlackChannelsOut({ project: slackMonitoringPlatformProject, type: "info" })?.channelName &&
    getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelPlatformInfrastructureCritical" })
    ? new newrelic.Workflow(
      `${projectName}-${e}-slackWorkflowPlatformInfrastructureCritical`,
      {
        name: `Platform Infrastructure Critical Slack Workflow - ${projectName}-${e}`,
        accountId: newrelicWhistleAccountId,
        enabled: true,
        destinationsEnabled: true,
        destinations: [{
          channelId: getNotificationChannel({ e: e, pn: projectName, dn: "slackChannelPlatformInfrastructureCritical" })!
        }],
        mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
        enrichmentsEnabled: true,
        enrichments: { nrqls: [] },
        issuesFilter: {
          name: `${projectName}-${e}-slackWorkflowPlatformInfrastructureCritical-issue-filter`,
          type: 'FILTER',
          predicates: [
            {
              attribute: 'labels.policyIds',
              operator: 'EXACTLY_MATCHES',
              values: [
                getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyPlatformInfrastructureCritical" })!.apply((id) => id)
              ],
            },
            {
              attribute: 'priority',
              operator: 'EQUAL',
              values: [
                'CRITICAL',
              ],
            },
          ]
        }
      },
      { provider: provider }
    )
    : undefined

const pagerDutyWorkflowPlatformInfrastructureInfo = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.Workflow> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info &&
    getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelPlatformInfrastructureInfo" })
    ? pagerDutyInfoNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.Workflow(
          `${projectName}-${e}-pagerDutyPlatformInfrastructureInfo`,
          {
            name: `Platform Infrastructure Info PagerDuty Workflow - ${projectName}-${e}`,
            accountId: newrelicWhistleAccountId,
            enabled: true,
            destinationsEnabled: true,
            destinations: [{
              channelId: getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelPlatformInfrastructureInfo" })!
            }],
            mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
            enrichmentsEnabled: true,
            enrichments: { nrqls: [] },
            issuesFilter: {
              name: `${projectName}-${e}-pagerDutyPlatformInfrastructureInfo-issue-filter`,
              type: 'FILTER',
              predicates: [
                {
                  attribute: 'labels.policyIds',
                  operator: 'EXACTLY_MATCHES',
                  values: [
                    getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyPlatformInfrastructureInfo" })!.apply((id) => id)
                  ],
                },
                {
                  attribute: 'priority',
                  operator: 'EQUAL',
                  values: [
                    'CRITICAL',
                  ],
                },
              ]
            }
          },
          { provider: provider }
        )
      )[0])
    : undefined

const pagerDutyWorkflowPlatformInfrastructureCritical = ({ e, projectEnv, projectName }:
  {
    e: Environments,
    projectEnv: projectEnvironment,
    projectName: Projects,
  }): Output<newrelic.Workflow> | undefined =>
  projectEnv?.pagerDutyAlertChannels?.info &&
    getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelPlatformInfrastructureCritical" })
    ? pagerDutyCriticalNewRelicIntKeys.apply(sid => sid
      .filter((i) => i.project == slackMonitoringPlatformProject)
      .map(({ key }) =>
        new newrelic.Workflow(
          `${projectName}-${e}-pagerDutyPlatformInfrastructureCritical`,
          {
            name: `Platform Infrastructure Critical PagerDuty Workflow - ${projectName}-${e}`,
            accountId: newrelicWhistleAccountId,
            enabled: true,
            destinationsEnabled: true,
            destinations: [{
              channelId: getNotificationChannel({ e: e, pn: projectName, dn: "pagerDutyChannelPlatformInfrastructureCritical" })!
            }],
            mutingRulesHandling: 'DONT_NOTIFY_FULLY_MUTED_ISSUES',
            enrichmentsEnabled: true,
            enrichments: { nrqls: [] },
            issuesFilter: {
              name: `${projectName}-${e}-pagerDutyPlatformInfrastructureCritical-issue-filter`,
              type: 'FILTER',
              predicates: [
                {
                  attribute: 'labels.policyIds',
                  operator: 'EXACTLY_MATCHES',
                  values: [
                    getPolicyId({ env: e, proj: projectName, policyName: "alertPolicyPlatformInfrastructureCritical" })!.apply((id) => id)
                  ],
                },
                {
                  attribute: 'priority',
                  operator: 'EQUAL',
                  values: [
                    'CRITICAL',
                  ],
                },
              ]
            }
          },
          { provider: provider }
        )
      )[0])
    : undefined

export const workflowsProject: Array<workflows> =
  flattenAlertReturn<workflows>(projectEnvironments.map((e) =>
    projectConfigs
      .filter(({ environments }) => environments[e] != undefined)
      .map(({ environments, projectName }): workflows =>
      ({
        slackWorkflowInfo: slackWorkflowInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackWorkflowCritical: slackWorkflowCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        emailWorkflow: emailWorkflow({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyWorkflowInfo: pagerDutyWorkflowInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyWorkflowCritical: pagerDutyWorkflowCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackWorkflowPlatformInfrastructureInfo: slackWorkflowPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        slackWorkflowPlatformInfrastructureCritical: slackWorkflowPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyWorkflowPlatformInfrastructureInfo: pagerDutyWorkflowPlatformInfrastructureInfo({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        pagerDutyWorkflowPlatformInfrastructureCritical: pagerDutyWorkflowPlatformInfrastructureCritical({ e: e, projectEnv: environments[e]!, projectName: projectName }),
        environment: e,
        project: projectName,
      }))))
