import { provider } from "./provider"
import { services, criticalProjects, infoProjects } from "./services"
import { slackChannelType, SlackMonitoringProjects, slackMonitoringProjects } from "../../monitoringConfig"
import * as pagerduty from "@pulumi/pagerduty"
import { Output } from "@pulumi/pulumi"
import { slackMonitorStackReference } from "./config"

type getSlackChannelsOutRet = {
  project: SlackMonitoringProjects
  type: slackChannelType
  team: {
    id: string
    name: string
  }
  channelName: string
  channelId: string
  channelMembers: Array<string>
}
const getSlackChannelsOut = ({ project, type }: { project: SlackMonitoringProjects, type: slackChannelType }): Output<Omit<getSlackChannelsOutRet, "channelMembers" | "project" | "type">> => slackMonitorStackReference.getOutput("slackChannelsOut")
  .apply((so) => (so as Array<getSlackChannelsOutRet>)
    .filter((sf) => sf.project == project && sf.type == type)
    .map((sm) => ({
      channelId: sm.channelId,
      channelName: sm.channelName,
      team: sm.team,
    }))[0])

const servicesSlackConnectionCritical = criticalProjects.flatMap((project) =>
  services.critical
    .filter((p) => p.project == project)
    .filter((sp) => slackMonitoringProjects.includes(sp.project))
    .map((svc) => {
      const type = "critical"
      const titleType = `${type.charAt(0).toUpperCase() + type.slice(1)}`
      const slackInfo = getSlackChannelsOut({ project: project, type: type })
      return {
        project: project,
        slackConnection: new pagerduty.SlackConnection(
          `${project}-Slack-${titleType}`,
          {
            sourceId: svc.service.id,
            sourceType: "service_reference",
            workspaceId: slackInfo.team.id,
            channelId: slackInfo.channelId,
            notificationType: "responder",
            configs: [{
              events: [
                "incident.acknowledged",
                "incident.annotated",
                "incident.delegated",
                "incident.escalated",
                "incident.priority_updated",
                "incident.reassigned",
                "incident.reopened",
                "incident.resolved",
                "incident.responder.added",
                "incident.responder.replied",
                "incident.status_update_published",
                "incident.triggered",
                "incident.unacknowledged",
              ],
              priorities: ["*"],
            }],
          },
          {
            provider: provider,
            dependsOn: services.critical.map((s) => s.service),
          }
        ),
      }
    }))

const servicesSlackConnectionInfo = infoProjects.flatMap((project) =>
  services.info
    .filter((p) => p.project == project)
    .filter((sp) => slackMonitoringProjects.includes(sp.project))
    .map((svc) => {
      const type = "info"
      const titleType = `${type.charAt(0).toUpperCase() + type.slice(1)}`
      const slackInfo = getSlackChannelsOut({ project: project, type: type })
      return {
        project: project,
        slackConnection: new pagerduty.SlackConnection(
          `${project}-Slack-${titleType}`,
          {
            sourceId: svc.service.id,
            sourceType: "service_reference",
            workspaceId: slackInfo.team.id,
            channelId: slackInfo.channelId,
            notificationType: "responder",
            configs: [{
              events: [
                "incident.acknowledged",
                "incident.annotated",
                "incident.delegated",
                "incident.escalated",
                "incident.priority_updated",
                "incident.reassigned",
                "incident.reopened",
                "incident.resolved",
                "incident.responder.added",
                "incident.responder.replied",
                "incident.status_update_published",
                "incident.triggered",
                "incident.unacknowledged",
              ],
              priorities: ["*"],
            }],
          },
          {
            provider: provider,
            dependsOn: services.info.map((s) => s.service),
          }
        ),
      }
    }))

export const servicesSlackConnection = {
  critical: servicesSlackConnectionCritical,
  info: servicesSlackConnectionInfo,
}
