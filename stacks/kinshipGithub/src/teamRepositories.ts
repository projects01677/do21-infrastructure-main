import { TeamRepository } from "@pulumi/github"
import { teams } from "./teams"
import { config, repoPermissions } from "./config"
import { all } from "@pulumi/pulumi"
import { zip } from "lodash"

// Todo: make this less confusing???
export const teamIdFromName = (name: string) =>
  all(teams.map((t) => t.id)).apply((ids) =>
    all(teams.map((t) => t.name)).apply((names) => zip(ids, names).filter(([_, n]) => name == n)[0][0]!)
  )

export const teamRepositories = config.repositories.flatMap(({ name: repoName, teamsWithPermission }) =>
  repoPermissions
    .flatMap(
      (permission) =>
        teamsWithPermission[permission]?.map((teamName) => ({
          permission,
          teamId: teamIdFromName(teamName),
          teamName,
        })) ?? []
    )
    .map(
      ({ permission, teamId, teamName }) =>
        new TeamRepository(`${repoName}-${teamName}`, {
          teamId,
          repository: repoName,
          permission,
        })
    )
)
