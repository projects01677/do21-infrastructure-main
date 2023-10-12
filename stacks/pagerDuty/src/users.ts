import { provider } from "./provider"
import { config, PagerDutyProjectSchedule } from "./config"
import * as pagerduty from "@pulumi/pagerduty"
import { PagerDutyScheduleId, PagerDutyUser, SlackMonitoringProjects } from "../../monitoringConfig"
import { Output } from "@pulumi/pulumi"

type PagerDutyAllUser = PagerDutyUser & { userId?: Output<string> }
type PagerDutyAllUsers = Array<PagerDutyAllUser>
type PagerDutyUserScheduleLayer = Pick<PagerDutyAllUser, "name" | "email" | "userId"> & PagerDutyProjectSchedule
type PagerDutyUserScheduleLayers = Array<PagerDutyUserScheduleLayer>

const pagerDutyManagedUsers = config.users
  .filter((u) => u.createUser === true)
  .map((u) => ({
    email: u.email,
    name: u.name,
    res: new pagerduty.User(u.email, {
      name: u.name,
      email: u.email,
      role: u.role,
      jobTitle: u.jobTitle,
      timeZone: u.timeZone,
      description: u.description,
    }, { provider: provider })
  }))

export const pagerDutyAllUsers: PagerDutyAllUsers =
  [...new Map([
    ...config.users
      .filter((u) => u.createUser === true)
      .map((pm) => ({
        ...pm,
        userId: pagerDutyManagedUsers
          .find((e) => e.email === pm.email && e.name === pm.name)?.res.id
      })),
    ...config.users
      .filter((u) => u.createUser !== true)
      .map((pu) => ({
        ...pu,
        userId: pagerduty.getUserOutput({ email: pu.email })?.id
      }))]
    .map((u) => [u["email"], u]))
    .values()]

const getUsersByProject = (
  (project: SlackMonitoringProjects): PagerDutyAllUsers => pagerDutyAllUsers
    .filter((u) => u.projects.find((p) => p.name == project))
)

export const getPagerDutyUsersByProjectSchedule = (
  ({ project, schedule }: { project: SlackMonitoringProjects, schedule: PagerDutyScheduleId }): PagerDutyAllUsers =>
    getUsersByProject(project)
      .filter((u) => u.projects
        .find((p) => p.name == project && p.schedules!.find((s) => s == schedule)))
      .map((su) => {
        return {
          ...su,
          projects: su.projects
            .filter((p) => p.name == project)
        }
      }))

export const getPagerDutyUsersScheduleLayer = (
  ({ project, schedule }: { project: SlackMonitoringProjects, schedule: PagerDutyScheduleId }): PagerDutyUserScheduleLayers => {
    const scheduleArray = getPagerDutyUsersByProjectSchedule({ project, schedule })
      .map((u): PagerDutyUserScheduleLayer => ({
        name: u.name,
        email: u.email,
        userId: u.userId,
        project: project,
        schedule: schedule,
      }))
    return schedule == "primary247"
      ? [...scheduleArray.slice(-1)].concat([...scheduleArray.slice(0, -1)])
      : scheduleArray
  }
)
