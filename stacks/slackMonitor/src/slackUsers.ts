import { Output } from "@pulumi/pulumi"
import * as slack from "@pulumi/slack"
import { globalMembers, membersOfProjects } from "./config"

type allUser = {
  email: string,
  id: Output<string>
}

export const getUserEmails = (): Array<allUser> => [
  ...globalMembers,
  ...membersOfProjects.flatMap((p) => Object.values(p)).flat(),
]
  .filter((item, i, s) => s.lastIndexOf(item) == i)
  .filter((ue) => ue != undefined)
  .map((u) => ({
    email: u!,
    id: slack.getUserOutput({ email: u }).apply((e) => e.id),
  }))
