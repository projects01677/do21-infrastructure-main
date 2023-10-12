import { projectConfiguration } from "../config"
import { newrelicAccountName } from "../provider"

const projectName = "gf-web"

export const gfwebConfig = (): projectConfiguration => ({
  projectName: projectName,
  newrelicAccountName: newrelicAccountName,
  environments: {
    dev: {
      slackAlertChannels: {
        slackChannelInfo: true,
        slackChannelCritical: true
      },
    },
    production: {
      slackAlertChannels: {
        slackChannelInfo: true,
        slackChannelCritical: true
      },
      pagerDutyAlertChannels: {
        info: true,
        critical: true
      },
    },
    staging: {
      slackAlertChannels: {
        slackChannelInfo: true,
        slackChannelCritical: true
      },
    }
  }
})
