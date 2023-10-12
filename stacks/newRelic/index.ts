import { secret, Config } from "@pulumi/pulumi"
import { provider } from "./config/provider"
import { newrelicApiKey } from "./resources/newrelicapi"
import { alertPolicies, alertPolicy } from "./resources/policies"
import { alertCondition, alertConditions } from "./resources/alertConditions"
import { exportAlertResource } from "./config/config"
import { notificationDestinations,notificationDestinationsProject } from "./resources/notificationDestinations"
import { notificationChannels, notificationChannelsProject } from "./resources/notificationChannels"
import { workflowsProject,workflows } from "./resources/workflows"

provider
newrelicApiKey
alertPolicies
notificationDestinationsProject
notificationChannelsProject
workflowsProject
alertConditions

const pulumiConfig = new Config()

export const newRelicLicenseKey = pulumiConfig.requireSecret("newrelicOrigIngestKey")
export const newRelicBrowserKey = pulumiConfig.requireSecret("newrelicOrigBrowserKey")
export const newRelicUserKey = secret(newrelicApiKey.key.apply((k) => k))
export const notificationDestinationsOut = exportAlertResource<notificationDestinations>(notificationDestinationsProject).filter((k) => k.id)
export const notificationChannelsOut = exportAlertResource<notificationChannels>(notificationChannelsProject).filter((k) => k.id)
export const workflowsOut = exportAlertResource<workflows>(workflowsProject).filter((k) => k.id)
export const alertPoliciesOut = exportAlertResource<alertPolicy>(alertPolicies)
export const alertConditionsOut = exportAlertResource<alertCondition>(alertConditions).filter((c) => c.id)
