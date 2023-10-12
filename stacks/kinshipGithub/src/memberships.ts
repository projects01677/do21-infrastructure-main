import { Membership } from "@pulumi/github"
import { config } from "./config"

export const memberships = config.memberships.map(
  ({githubHandle, role}) =>
    new Membership(githubHandle, {
      username: githubHandle,
      role: role,
    })
)
