import { provider } from "./provider"
import { pagerDutyEscalationPolicies, mergedUserProjects } from "./config"
import { schedules } from "./schedules"
import * as pagerduty from "@pulumi/pagerduty"
import { uniq } from "lodash"

const escalationPolicyCritical = () => {
  const escSchds = schedules.filter(({ sidSchedule }) => sidSchedule == "primary247" || sidSchedule == "secondary247")
  const matchingProjects = uniq(mergedUserProjects.filter((proj) => escSchds.find((cs) => cs.sidProject == proj.name)).map((pn) => pn.name))
  return matchingProjects.map((p) => ({
    project: p,
    escalationPolicy: new pagerduty.EscalationPolicy(`${p}-Critical`, {
      name: `${p} Critical`,
      numLoops: pagerDutyEscalationPolicies.critical!.numLoops,
      rules: escSchds
        .filter((s) => s.sidProject == p)
        .sort((s1, s2) => {
          return s1.sidSchedule == "primary247" && s2.sidSchedule != "primary247" ? -1 : 1
        })
        .map((sid) => ({
          escalationDelayInMinutes: pagerDutyEscalationPolicies.critical!.rules[0].escalationDelayInMinutes,
          targets: [{
            type: pagerDutyEscalationPolicies.critical!.rules[0].targets[0].type,
            id: sid.schedule.id,
          }],
        })),
    }, { provider: provider, dependsOn: schedules.map((sch) => sch.schedule) })
  })
  )
}

const escalationPolicyInfo = () => {
  const escSchds = schedules.filter(({ sidSchedule }) => sidSchedule == "weekdays")
  const matchingProjects = uniq(mergedUserProjects.filter((proj) => escSchds.find((cs) => cs.sidProject == proj.name)).map((pn) => pn.name))
  return matchingProjects.map((p) => ({
    project: p,
    escalationPolicy: new pagerduty.EscalationPolicy(`${p}-Info`, {
      name: `${p} Info`,
      numLoops: pagerDutyEscalationPolicies.info!.numLoops,
      rules: escSchds
        .filter((s) => s.sidProject == p)
        .map((sid) => ({
          escalationDelayInMinutes: pagerDutyEscalationPolicies.info!.rules[0].escalationDelayInMinutes,
          targets: [{
            type: pagerDutyEscalationPolicies.info!.rules[0].targets[0].type,
            id: sid.schedule.id
          }],
        })),
    }, { provider: provider, dependsOn: schedules.map((sch) => sch.schedule) })
  })
  )
}

export const policies = {
  critical: escalationPolicyCritical(),
  info: escalationPolicyInfo(),
}
