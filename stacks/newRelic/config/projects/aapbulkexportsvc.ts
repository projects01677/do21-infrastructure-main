import { projectConfiguration } from "../config"
import { Config } from "@pulumi/pulumi"
import { newrelicAccountName } from "../provider"

const projectName = "aap-bulkexport-api"

//const clusterPrefix = "kinship-shared-services"
//const containerName = "bulkexport-api"

export const aapbulkexportsvcConfig = (): projectConfiguration => ({
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
