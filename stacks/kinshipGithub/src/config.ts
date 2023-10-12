import { userConfig } from "../../userConfig"

export type RepoNames =
  | "hack2021a-wizdle"
  | "hack2021a-the-pass"
  | "hack2021a-san-francisco-meows"
  | "hack2021a-pursuit"

export type TeamNames =
  | "Wisdom"
  | "Whistle"
  | "WhistleFirmware"
  | "Hackathon"
  | "Unifio"
  | "WhistleSoftware"
  | "Kinship"
  | "Hackathon2021a"
  | "Hackathon2021aWizdle"
  | "Hackathon2021aThePass"
  | "Hackathon2021aSanFranciscoMeows"
  | "Hackathon2021aPursuit"
  | "KinshipIntegrations"
  | "ShelterAnimalsCount"
  | "DataPlatform"
  | "Kong"
  | "Adopt-a-Pet"
  | "Omega"
  | "AAP-Rehome"
  | "Templates"
  | "Graveflex"
  | "QA-Manual"
  | "QA-Automation"
  | "QA"
  | "Barkibu"
  | "theKin"
  | "GoodFriend"
  | "Kinship-co"
  | "PetExec"
  | "TheWildest"
  | "VetInsight"
  | "TheWildest-UK"
  | "Q4theKin"
  

export const repoPermissions = ["push", "pull", "maintain", "admin"] as const
type Repositories = Array<{
  name: RepoNames
  teamsWithPermission: {
    [key in typeof repoPermissions[number]]?: Array<TeamNames>
  }
}>

export type Teams = Array<{ name: TeamNames; children?: Teams }>

export type MembershipRoles = "member" | "admin"

type Configuration = {
  repositories: Repositories
  teams: Teams
  memberships: Array<{ githubHandle: string; role: MembershipRoles }>
  teamMemberships: Array<{ githubHandle: string; teams: Array<TeamNames>; role: "maintainer" | "member" }>
}

export const config: Configuration = {
  repositories: [
    // Do not add to this section. We've decided it's more beneficial to just allow users to create/configure Github Repos by hand
    { name: "hack2021a-wizdle", teamsWithPermission: { push: ["Hackathon2021aWizdle"] } },
    { name: "hack2021a-the-pass", teamsWithPermission: { push: ["Hackathon2021aThePass"] } },
    { name: "hack2021a-san-francisco-meows", teamsWithPermission: { push: ["Hackathon2021aSanFranciscoMeows"] } },
    { name: "hack2021a-pursuit", teamsWithPermission: { push: ["Hackathon2021aPursuit"] } },
  ],
  teams: [
    { name: "Barkibu" },
    { name: "QA", children: [{name: "QA-Manual" }, { name: "QA-Automation" }] },
    { name: "Whistle", children: [{ name: "WhistleFirmware" }, { name: "WhistleSoftware" }] },
    { name: "Unifio" },
    { name: "Graveflex" },
    { name: "Wisdom" },
    { name: "Adopt-a-Pet", children: [{ name: "Omega" }, { name: "AAP-Rehome" }] },
    { name: "GoodFriend" },
    {
      name: "Kinship",
      children: [
        { name: "KinshipIntegrations" },
        { name: "ShelterAnimalsCount" },
        { name: "Kong" },
        { name: "DataPlatform" },
        { name: "Templates" },
        { name: "theKin"},
        { name: "Kinship-co"},
      ],
    },
    {
      name: "Hackathon",
      children: [
        {
          name: "Hackathon2021a",
          children: [
            { name: "Hackathon2021aWizdle" },
            { name: "Hackathon2021aThePass" },
            { name: "Hackathon2021aSanFranciscoMeows" },
            { name: "Hackathon2021aPursuit" },
          ],
        },
      ],
    },
    { name : "PetExec"},
    { name : "TheWildest"},
    { name : "VetInsight"},
    { name : "TheWildest-UK"},
    { name : "Q4theKin"},
  ],
  memberships: userConfig.users
    .filter((u) => u.github)
    .map(({ github }) => ({
      githubHandle: github!.handle,
      role: github!.role ?? "member",
    })),
  teamMemberships: userConfig.users
    .filter((u) => u.github!)
    .map(({ github }) => ({
      githubHandle: github!.handle,
      teams: github!.teams,
      role: github!.role == "admin" ? "maintainer" : "member",
    })),
}
