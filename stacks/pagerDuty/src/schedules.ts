import { provider } from "./provider"
import { pagerDutySchedules, PagerDutyScheduleAccountTimeZone, mergedUserProjects } from "./config"
import { getPagerDutyUsersScheduleLayer} from "./users"
import * as pagerduty from "@pulumi/pagerduty"

const ScheduleConfigs = mergedUserProjects
  .flatMap(({ name, schedules }) => {
    const projName = name
    return schedules!.map((schedule) => {
      const { name, ...projLayer } = pagerDutySchedules[schedule]
      return {
        project: projName,
        schedule: schedule,
        timeZone: PagerDutyScheduleAccountTimeZone,
        layers: [
          {
            name: `${projName} ${pagerDutySchedules[schedule].name}`,
            ...projLayer,
            users: getPagerDutyUsersScheduleLayer({ project: projName, schedule: schedule })
            .filter((e) => e.userId !== undefined)
            .map((e) => e.userId!)
          }
        ]
      }
    })
  })

export const schedules = ScheduleConfigs.map((s) => ({
  sidProject: s.project,
  sidSchedule: s.schedule,
  schedule: new pagerduty.Schedule(
    `${s.project} ${s.schedule}`, {
    name: `${s.project} ${s.schedule}`,
    layers: s.layers.map((l) => ({
      ...l,
    })),
    timeZone: s.timeZone,
  },
    { provider: provider})
}))
