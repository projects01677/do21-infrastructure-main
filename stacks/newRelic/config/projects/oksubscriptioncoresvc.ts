import { projectConfiguration } from "../config"
import { Config } from "@pulumi/pulumi"
import { newrelicAccountName } from "../provider"

const projectName = "ok-subscription-core-svc"

export const oksubscriptioncoresvcConfig = (): projectConfiguration => ({
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
      platformInfrastructureConditions: {
        podsMissingAlertCondition: {
          policyType: "critical",
          thresholds: {
            critical: {
              duration: 8,
              value: 0,
              timeFunction: "all",
            }
          }
        },
        containerDiskFullAlertCondition: {
          policyType: "critical",
          thresholds: {
            critical: {
              duration: 5,
              value: 90,
              timeFunction: "all",
            },
            warning: {
              duration: 5,
              value: 75,
              timeFunction: "all",
            }
          }
        },
        podIsNotReadyAlertCondition: {
          policyType: "critical",
          thresholds: {
            critical: {
              duration: 10,
              value: 0,
              timeFunction: "all",
            },
          }
        },
        podNotScheduledAlertCondition: {
          policyType: "critical",
          thresholds: {
            critical: {
              duration: 8,
              value: 0,
              timeFunction: "all",
            },
          }
        },
        containerHighMemoryAlertCondition: {
          policyType: "critical",
          thresholds: {
            critical: {
              duration: 5,
              value: 95,
              timeFunction: "all",
            },
            warning: {
              duration: 5,
              value: 85,
              timeFunction: "all",
            }
          }
        },
        containerHighCPUAlertCondition: {
          policyType: "critical",
          thresholds: {
            critical: {
              duration: 5,
              value: 95,
              timeFunction: "all",
            },
            warning: {
              duration: 5,
              value: 90,
              timeFunction: "all",
            }
          }
        },
      }
    },
    staging: {
      slackAlertChannels: {
        slackChannelInfo: true,
        slackChannelCritical: true
      },
    }
  }
})
