import { slackChannelOut, slackTeam } from "../monitoringConfig"
import { slackChannels } from "./src/slackchannels"

// Outputs
export const slackChannelsOut: Array<slackChannelOut> = slackChannels
  .map((sc) => ({
    project: sc.project,
    type: sc.type,
    team: slackTeam,
    channelName: sc.slackChannel.name,
    channelId: sc.slackChannel.id,
    channelMembers: sc.slackChannel.permanentMembers,
  }))
