import { provider } from "./provider"
import { config, globalMembers, membersOfProjects, slackChannel, slackChannelReturn } from "./config"
import * as slack from "@pulumi/slack"
import { getUserEmails } from "./slackUsers"

const allProjectUsers = getUserEmails()
  .filter((u) => u.email && u.id)
const slackchannel = ({ sc }: { sc: slackChannel }): slack.Conversation => {
  const titleType = `${sc.type.charAt(0).toUpperCase() + sc.type.slice(1)}`
  const chanName = `${sc.channelPrefix}-${sc.project}`
  const allMemberIds = [
    ...globalMembers,
    ...membersOfProjects.flatMap((m) => m[sc.project]),]
    .filter((item, i, s) => s.lastIndexOf(item) == i)
    .filter((ue) => ue != undefined)
    .flatMap((u) => allProjectUsers
      .filter((gu) => gu.email == u && gu.id)
      .flatMap((mu) => mu.id)
    )

  return new slack.Conversation(
    `${sc.project}-slackChannel-${titleType}`,
    {
      name: chanName,
      purpose: `${sc.project} Alert/Monitoring ${titleType} Channel`,
      permanentMembers: allMemberIds,
      ...sc.options
    },
    { provider: provider }
  )
}

export const slackChannels: Array<slackChannelReturn> = config.slackChannels
  .map((sc) => ({
    project: sc.project,
    type: sc.type,
    slackChannel: slackchannel({ sc: sc }),
  }))
