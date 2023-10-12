import { Conversation } from "@pulumi/slack"
import { usersPartOfProject } from "../../../utility/usersPartOfProject"
import { SlackMonitoringProjects, slackMonitoringProjects, slackChannelType, slackChannelTypes } from "../../monitoringConfig"

export type options = {
  isPrivate: boolean
  actionOnDestroy?: "none" | "archive"
  isArchived?: boolean
  permanentMembers?: Array<string>
  purpose?: string
  topic?: string
}
export type slackChannel = {
  channelPrefix: string
  project: SlackMonitoringProjects
  type: "info" | "critical"
  options: options
}

export type slackChannels = Array<slackChannel>

type Configuration = {
  slackChannels: slackChannels
}
export type slackChannelReturn = {
  project: SlackMonitoringProjects,
  type: slackChannelType,
  slackChannel: Conversation
}

export const globalMembers: Array<string> = [
  "isaac@unif.io",
  "devops@whistle.com",
  "tony.walls@whistle.com",
  "sumant.munjal@kinship.co",
  "rodrigo.morales.ext@kinship.co",
  "oleksandr.rudenko.ext@kinship.co"
]

type membersOfProject = {
  [key in SlackMonitoringProjects]?: Array<string | undefined>
}

export const membersOfProjects: Array<membersOfProject> = slackMonitoringProjects
  .map((p) => ({
    [p]: usersPartOfProject(p).flatMap((u) => u.email)
  }))

export const defaultOptions: options = {
  isPrivate: true,
  actionOnDestroy: "archive",
  isArchived: false,
}
export const flattenReturn = <T>(arrOfArr: Array<Array<T>>): Array<T> => {
  return arrOfArr.reduce((accum, arr) => {
    return [...accum, ...arr]
  }, [])
}

export const config: Configuration = {
  slackChannels: flattenReturn<slackChannel>(slackMonitoringProjects
    .map((p) => slackChannelTypes
      .map((c): slackChannel => ({
        channelPrefix: `alert-${c.substring(0, 4)}`,
        project: p,
        type: c,
        options: defaultOptions,
      }))))
}
