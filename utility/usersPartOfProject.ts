import { SlackMonitoringProjects } from "../stacks/monitoringConfig"
import { Projects, userConfig } from "../stacks/userConfig"

export const usersPartOfProject = (projectName: Projects | SlackMonitoringProjects) =>
  userConfig.users
    .filter(
      (u) =>
        u.pagerDuty &&
        u.pagerDuty.projects.some((p) => p.name == projectName)
    )
