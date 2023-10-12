import { pagerDutyAllUsers } from "./src/users"
import { schedules } from "./src/schedules"
import { policies } from "./src/escalation"
import { services } from "./src/services"
import { servicesIntegrationNewRelic } from "./src/servicesIntegrations"
import { servicesSlackConnection } from "./src/servicesSlackConnections"
import { pagerDutyServiceIntKeyOutput } from "../monitoringConfig"

pagerDutyAllUsers
schedules
policies
services
servicesIntegrationNewRelic
servicesSlackConnection

// Outputs
export const criticalServiceIds = services.critical
  .filter((s) => s.service.id && s.service.name)
  .map((s) => ({ project: s.project, id: s.service.id, name: s.service.name }))
export const infoServiceIds = services.info
  .filter((s) => s.service.id)
  .map((s) => ({ project: s.project, id: s.service.id, name: s.service.name }))
export const criticalServiceNewRelicIntKeys: Array<pagerDutyServiceIntKeyOutput> = servicesIntegrationNewRelic.critical
  .filter((i) => i.serviceIntegration.integrationKey && i.serviceIntegration.name)
  .map((i) => ({ project: i.project, key: i.serviceIntegration.integrationKey, name: i.serviceIntegration.name }))
export const infoServiceNewRelicIntKeys: Array<pagerDutyServiceIntKeyOutput> = servicesIntegrationNewRelic.info
  .filter((i) => i.serviceIntegration.integrationKey && i.serviceIntegration.name)
  .map((i) => ({ project: i.project, key: i.serviceIntegration.integrationKey, name: i.serviceIntegration.name }))
