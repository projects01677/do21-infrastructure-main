import { StackReference} from "@pulumi/pulumi"
import { uniq } from "lodash"
import { userConfig } from "../../userConfig"
import { PagerDutyProject, PagerDutyScheduleId, PagerDutyScheduleIds, PagerDutyUsers, SlackMonitoringProjects, TimeZones } from "../../monitoringConfig"

export type PagerDutySchedule = {
  name: string
  start: string
  rotationVirtualStart: string
  rotationTurnLengthSeconds: number
  users?: Array<string>
  restrictions?: Array<any>
}

export const PagerDutyScheduleAccountTimeZone: TimeZones = "America/Los_Angeles"
export type PagerDutySchedules = { [key in PagerDutyScheduleId]: PagerDutySchedule }
export const pagerDutySchedules: PagerDutySchedules = {
  primary247: {
    name: "24/7 Coverage (Primary)",
    start: "2018-05-29T13:12:00-07:00",
    rotationVirtualStart: "2022-02-07T09:00:00-07:00",
    rotationTurnLengthSeconds: 604800,
  },
  secondary247: {
    name: "24/7 Coverage (Secondary)",
    start: "2018-05-29T13:12:00-07:00",
    rotationVirtualStart: "2022-02-07T09:00:00-07:00",
    rotationTurnLengthSeconds: 604800,
  },
  weekdays: {
    name: "Weekday Coverage",
    start: "2018-05-29T13:12:00-07:00",
    rotationVirtualStart: "2022-02-07T09:00:00-07:00",
    rotationTurnLengthSeconds: 604800,
    restrictions: [
      {
        durationSeconds: 32400,
        startDayOfWeek: 1,
        startTimeOfDay: "09:00:00",
        type: "weekly_restriction",
      },
      {
        durationSeconds: 32400,
        startDayOfWeek: 2,
        startTimeOfDay: "09:00:00",
        type: "weekly_restriction",
      },
      {
        durationSeconds: 32400,
        startDayOfWeek: 3,
        startTimeOfDay: "09:00:00",
        type: "weekly_restriction",
      },
      {
        durationSeconds: 32400,
        startDayOfWeek: 4,
        startTimeOfDay: "09:00:00",
        type: "weekly_restriction",
      },
      {
        durationSeconds: 32400,
        startDayOfWeek: 5,
        startTimeOfDay: "09:00:00",
        type: "weekly_restriction",
      },
    ]
  },
}

export type EscalationTargetTypes =
  | "schedule_reference"
  | "user_reference"

export type PagerDutyProjectSchedule = {
  project: SlackMonitoringProjects
  schedule: PagerDutyScheduleId
}

type EscalationRule = {
  escalationDelayInMinutes: number
  targets: Array<{
    id?: string
    type: EscalationTargetTypes
  }>
}
type EscalationPolicies = {
  [key in EscalationPolicyIds]?: {
    numLoops: number
    rules: Array<EscalationRule>
  }
}

type EscalationPolicyIds =
  | "critical"
  | "info"

export const pagerDutyEscalationPolicies: EscalationPolicies = {
  critical: {
    numLoops: 9,
    rules: [{
      escalationDelayInMinutes: 30,
      targets: [
        {
          type: "schedule_reference",
        },
      ],
    }]
  },
  info: {
    numLoops: 9,
    rules: [{
      escalationDelayInMinutes: 30,
      targets: [
        {
          type: "schedule_reference",
        },
      ],
    }]
  }
}

type alertCreationTypes =
  | "create_alerts_and_incidents"
  | "create_incidents"

type Service = {
  name?: string
  autoResolveTimeout: string
  acknowledgementTimeout: string
  escalationPolicy?: string
  alertCreation: alertCreationTypes
  description?: string
}
type ServiceIds =
  | "critical"
  | "info"

type Services = {
  [key in ServiceIds]?: Service
}

export const pagerDutySevices: Services = {
  critical: {
    autoResolveTimeout: "null",
    acknowledgementTimeout: "1800",
    alertCreation: "create_alerts_and_incidents",
  },
  info: {
    autoResolveTimeout: "null",
    acknowledgementTimeout: "1800",
    alertCreation: "create_alerts_and_incidents",
  },
}

type Configuration = {
  users: PagerDutyUsers
  projects: Array<PagerDutyProject>
  schedules: PagerDutySchedules
  escalationPolicies: EscalationPolicies
}

const mergeUserProjects = (
  projects: Array<PagerDutyProject>): Array<PagerDutyProject> => {
  return Object.values(projects.reduce((a, b) => {
    a[b.name] = a[b.name] || { name: b.name, schedules: [] }
    a[b.name].schedules = uniq([...a[b.name].schedules, ...b.schedules ?? []])
    return a
  }, {} as any))
}

const getProjectsScheduleDefaults = (projects: Array<PagerDutyProject>): Array<PagerDutyProject> => {
  return Object.values(projects.reduce((a, b) => {
    a[b.name] = a[b.name] || { name: b.name, schedules: [] }
    a[b.name].schedules = uniq([...a[b.name].schedules, ...b.schedules ?? [...PagerDutyScheduleIds]])
    return a
  }, {} as any))
}

export const config: Configuration = {

  users: userConfig.users
    .filter((u) => u.pagerDuty)
    .map(({ pagerDuty }) => ({
      name: pagerDuty!.name,
      email: pagerDuty!.email ?? pagerDuty!.name,
      role: pagerDuty!.role ?? "user",
      createUser: pagerDuty!.createUser,
      projects: getProjectsScheduleDefaults(pagerDuty!.projects),
      jobTitle: pagerDuty?.jobTitle,
      timeZone: pagerDuty?.timeZone ?? PagerDutyScheduleAccountTimeZone,
      description: pagerDuty?.description,
    })),
  projects: userConfig.users
    .filter((u) => u.pagerDuty)
    .flatMap((p) => (getProjectsScheduleDefaults(p.pagerDuty!.projects))),
  schedules: pagerDutySchedules,
  escalationPolicies: pagerDutyEscalationPolicies
}

export const slackMonitorStackReference = new StackReference("slackmonitor")
export const mergedUserProjects: Array<PagerDutyProject> = mergeUserProjects(config.projects)
