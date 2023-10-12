import { Config, Output } from "@pulumi/pulumi"
import { Projects } from "./userConfig"

// Slack
export const slackMonitoringPlatformProject = "platform-infrastructure" as const
export type SlackMonitoringProjects = Projects | typeof slackMonitoringPlatformProject
export const slackMonitoringProjects: Array<SlackMonitoringProjects> = [
  "aap-bulkexport-api",
  "aap-npasignup-api",
  "aap-petlist-api",
  "aap-search-api",
  "ki-document-svc",
  "ki-identity-svc",
  "kong",
  "mparticlejob",
  "ok-health-svc",
  "ok-note-svc",
  "ok-pet-profile-svc",
  "ok-subscription-core-svc",
  "ok-user-profile-svc",
  "ok-tag-svc",
  "pe-backend",
  "pe-frontend",
  "petsearch",
  "sac-apimetricsdata-api",
  "vetinsight",
  "wp-wisdom-svc",
  slackMonitoringPlatformProject,
  "ok-okta-event-webhook-svc",
  "aap-rehome-svc",
  "gf-web",
  "gf-provider-api",
  "the-kin-content-api",
  "the-kin-vet-chat-summary",
  "the-kin-website",
  "kinship-kafka",
  "ok-notification-svc",
  "ok-back4app-svc",
  "ok-payment-svc",
]

export const slackChannelTypes = ["info", "critical"] as const
export type slackChannelType = typeof slackChannelTypes[number]
export type slackConfigTeam = {
  id: string
  name: string
}
export const slackTeam = (new Config).getObject<slackConfigTeam>("team")

export type slackChannelOut = {
  project: SlackMonitoringProjects
  type: slackChannelType
  team?: slackConfigTeam
  channelName: Output<string>
  channelId: Output<string>
  channelMembers: Output<Array<string> | undefined>
}

// Pagerduty
export const PagerDutyScheduleIds = ["primary247", "secondary247", "weekdays"] as const
export type PagerDutyScheduleId = typeof PagerDutyScheduleIds[number]

export type PagerDutyUserRole =
  | "user"
  | "admin"
  | "limited_user"
  | "observer"
  | "owner"
  | "read_only_user"
  | "read_only_limited_user"
  | "restricted_access"

export type PagerDutyProject = {
  name: SlackMonitoringProjects
  schedules?: Array<PagerDutyScheduleId>
}
export type TimeZones = string

export type PagerDutyUser = {
  name: string
  email: string
  role?: PagerDutyUserRole
  createUser: boolean
  projects: Array<PagerDutyProject>
  jobTitle?: string
  timeZone?: TimeZones
  description?: string
}
export type PagerDutyUsers = Array<PagerDutyUser>

export type pagerDutySecheduleIdOutput = {
  id: string,
  name: string,
  project: Projects
}
export type pagerDutyServiceIntKeyOutput = {
  key: Output<string>
  name: Output<string>
  project: SlackMonitoringProjects
}
