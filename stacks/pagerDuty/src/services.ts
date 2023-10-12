import { provider } from "./provider"
import { mergedUserProjects, PagerDutyProjectSchedule, pagerDutySevices } from "./config"
import { policies } from "./escalation"
import * as pagerduty from "@pulumi/pagerduty"
import { uniq } from "lodash"
import { PagerDutyScheduleId } from "../../monitoringConfig"

export const getProjectsBySchedule =
  (schedule: PagerDutyScheduleId): Array<PagerDutyProjectSchedule> =>
    mergedUserProjects.filter((p) => p.schedules!.find((s) => s == schedule))
      .map((ps) => ({
        project: ps.name,
        schedule: schedule,
      }))
export const criticalProjects = uniq([
  ...getProjectsBySchedule("primary247").map((p) => p.project),
  ...getProjectsBySchedule("secondary247").map((p) => p.project)])
export const infoProjects = getProjectsBySchedule("weekdays").map((p) => p.project)

const serviceCritical = criticalProjects
  .flatMap((project) =>
    policies.critical.filter((e) => e.project == project)
      .map((ep) => ({
        project: project,
        service: new pagerduty.Service(`${project}-Critical`, {
          name: `${project} Critical`,
          ...pagerDutySevices.critical,
          escalationPolicy: ep.escalationPolicy.id,
        }, { provider: provider, dependsOn: policies.critical.map((p) => p.escalationPolicy) })
      })))

const serviceInfo = infoProjects
  .flatMap((project) =>
    policies.info.filter((e) => e.project == project)
      .map((ep) => ({
        project: project,
        service: new pagerduty.Service(`${project}-Info`, {
          name: `${project} Info`,
          ...pagerDutySevices.info,
          escalationPolicy: ep.escalationPolicy.id,
        }, { provider: provider, dependsOn: policies.info.map((p) => p.escalationPolicy) })
      })))

export const services = {
  critical: serviceCritical,
  info: serviceInfo,
}
