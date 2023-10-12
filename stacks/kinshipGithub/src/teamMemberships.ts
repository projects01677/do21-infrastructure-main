import { TeamMembership } from "@pulumi/github"
import { config } from "./config"
import { teamIdFromName } from "./teamRepositories"

export const teamMemberships = config.teamMemberships.flatMap(({teams, githubHandle, role}) =>
  teams.map(
    (team) =>
      new TeamMembership(`${team}-${githubHandle}`, {
        teamId: teamIdFromName(team),
        username: githubHandle,
        role: role,
      })
  )
)
