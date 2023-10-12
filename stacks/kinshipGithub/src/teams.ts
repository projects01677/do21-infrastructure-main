import { Team } from "@pulumi/github"
import { Output } from "@pulumi/pulumi"
import { Teams, config } from "./config"

const flattenedTeams = (teamCfg: Teams, parentTeamId?: Output<number>): Array<Team> =>
  teamCfg.flatMap((tc) => {
    const team = new Team(tc.name, {
      name: tc.name,
      parentTeamId,
      privacy: "closed",
    })
    return [
      team,
      ...(tc.children
        ? flattenedTeams(
            tc.children,
            team.id.apply((id) => Number(id))
          )
        : []),
    ]
  })

export const teams = flattenedTeams(config.teams)
