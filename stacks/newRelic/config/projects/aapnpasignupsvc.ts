import { projectConfiguration } from "../config"
import { Config } from "@pulumi/pulumi"
import { newrelicAccountName } from "../provider"

const projectName = "aap-npasignup-api"

//const clusterPrefix = "kinship-shared-services"
//const containerName = "npasignup-api"

export const aapnpasignupsvcConfig = (): projectConfiguration => ({
  projectName: projectName,
  newrelicAccountName: newrelicAccountName,
  environments: {
    dev: {
      slackAlertChannels: {
        slackChannelInfo: true,
        slackChannelCritical: true
      },
    },
    staging: {
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
    }
  }
})
