import { provider } from "./provider"
import { services, criticalProjects, infoProjects } from "./services"
import * as pagerduty from "@pulumi/pagerduty"

const newRelicVendor = pagerduty.getVendor({
  name: "New Relic",
})

const servicesIntegrationNewRelicCritical = criticalProjects.flatMap(
  (project) =>
    services.critical
      .filter((p) => p.project == project)
      .map((svc) => ({
        project: project,
        serviceIntegration: new pagerduty.ServiceIntegration(
          `${project}-NewRelic-Critical`,
          {
            name: `${project} NewRelic Critical`,
            service: svc.service.id,
            vendor: newRelicVendor.then((v) => v.id),
          },
          {
            provider: provider,
            dependsOn: services.critical.map((s) => s.service),
          }
        ),
      }))
)

const servicesIntegrationNewRelicInfo = infoProjects.flatMap((project) =>
  services.info
    .filter((p) => p.project == project)
    .map((svc) => ({
      project: project,
      serviceIntegration: new pagerduty.ServiceIntegration(
        `${project}-NewRelic-Info`,
        {
          name: `${project} NewRelic Info`,
          service: svc.service.id,
          vendor: newRelicVendor.then((v) => v.id),
        },
        {
          provider: provider,
          dependsOn: services.info.map((s) => s.service),
        }
      ),
    }))
)

export const servicesIntegrationNewRelic = {
  critical: servicesIntegrationNewRelicCritical,
  info: servicesIntegrationNewRelicInfo,
}
