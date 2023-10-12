import * as newrelic from "@pulumi/newrelic"
import { Environments } from "../../../utility/Environments"
import { Projects } from "../../userConfig"
import { projectEnvironments, flattenAlertReturn, alertResourceRequired } from "../config/config"
import { alertChannelsProject } from "./alertChannels"
import { alertPolicies, alertPolicy } from "./policies"
import { provider } from "../config/provider"
import { Output, all } from "@pulumi/pulumi"
export type alertPolicyChannel = {
  policyWithChannelsInfo?: newrelic.AlertPolicyChannel,
  policyWithChannelsCritical?: newrelic.AlertPolicyChannel,
  policyWithChannelsGoldenSignals?: newrelic.AlertPolicyChannel,
  policyWithChannelsPlatformInfrastructureCritical?: newrelic.AlertPolicyChannel,
  policyWithChannelsPlatformInfrastructureInfo?: newrelic.AlertPolicyChannel,
} & alertResourceRequired
/*
ISSUE: Unable to reference AlertPolicyChannel.id (and other id attributes)
      Workaround: https://github.com/pulumi/pulumi-newrelic/issues/10
*/

const getChannelIds = ({ e, pn, alertType, isPlatformInfra }: { e: Environments, pn: Projects, alertType: "info" | "critical", isPlatformInfra: boolean }): Output<Array<number>> =>
  alertType == "info"
    ? !isPlatformInfra
      ? alertChannelsProject
        .filter((ac) =>
          ac.project == pn &&
          ac.environment == e)
        .map((ac) => all([ac.emailChannel?.id, ac.pagerDutyChannelInfo?.id, ac.slackChannelInfo?.id])
          .apply(([em, p, s]) => [em, p, s]
            .filter((id) => id)
            .map((ia) => parseInt(ia)).sort((n1, n2) => n1 - n2)))[0]
      : alertChannelsProject
        .filter((ac) =>
          ac.project == pn &&
          ac.environment == e)
        .map((ac) => all([
          ac.pagerDutyChannelPlatformInfrastructureInfo?.id,
          ac.slackChannelPlatformInfrastructureInfo?.id])
          .apply(([pip, pis]) => [pip, pis]
            .filter((id) => id)
            .map((piia) => parseInt(piia)).sort((n1, n2) => n1 - n2)))[0]
    : !isPlatformInfra
      ? alertChannelsProject
        .filter((ac) =>
          ac.project == pn &&
          ac.environment == e)
        .map((ac) => all([ac.emailChannel?.id, ac.pagerDutyChannelCritical?.id, ac.slackChannelCritical?.id])
          .apply(([cem, cp, cs]) => [cem, cp, cs]
            .filter((id) => id)
            .map((ia) => parseInt(ia)).sort((n1, n2) => n1 - n2)))[0]
      : alertChannelsProject
        .filter((ac) =>
          ac.project == pn &&
          ac.environment == e)
        .map((ac) => all([
          ac.pagerDutyChannelPlatformInfrastructureCritical?.id,
          ac.slackChannelPlatformInfrastructureCritical?.id,])
          .apply(([picp, pics]) => [picp, pics]
            .filter((id) => id)
            .map((piia) => parseInt(piia)).sort((n1, n2) => n1 - n2)))[0]

const policyWithChannelsInfo = ({ e, pn, ap }:
  {
    e: Environments,
    pn: Projects,
    ap: alertPolicy,
  }): newrelic.AlertPolicyChannel | undefined => {
  const cids = getChannelIds({ e: e, pn: pn, alertType: "info", isPlatformInfra: false })
  return (cids.apply((c) => (c.length != 0)) &&
    ap.alertPolicyInfo?.id)
    ? new newrelic.AlertPolicyChannel(
      `${pn}-${e}-policyWithChannelsInfo`,
      {
        policyId: ap.alertPolicyInfo.id.apply((id) => parseInt(id)),
        channelIds: cids,
      },
      { provider: provider }
    )
    : undefined
}



// Map Crtitical alert policy to Critical alert channels
const policyWithChannelsCritical = ({ e, pn, ap }:
  {
    e: Environments,
    pn: Projects,
    ap: alertPolicy,
  }): newrelic.AlertPolicyChannel | undefined => {
  const cids = getChannelIds({ e: e, pn: pn, alertType: "critical", isPlatformInfra: false })
  return (cids.apply((c) => (c.length != 0)) &&
    ap.alertPolicyCritical?.id)
    ? new newrelic.AlertPolicyChannel(
      `${pn}-${e}-policyWithChannelsCritical`,
      {
        policyId: ap.alertPolicyCritical.id.apply((id) => parseInt(id)),
        channelIds: cids,
      },
      { provider: provider }
    )
    : undefined

}
// Golden Signals alert policy to Golden Signals alert channels
const policyWithChannelsGoldenSignals = ({ e, pn, ap }:
  {
    e: Environments,
    pn: Projects,
    ap: alertPolicy,
  }): newrelic.AlertPolicyChannel | undefined => {
  const cids = getChannelIds({ e: e, pn: pn, alertType: "critical", isPlatformInfra: false })
  return (cids.apply((c) => (c.length != 0)) &&
    ap.alertPolicyGoldenSignals?.id)
    ? new newrelic.AlertPolicyChannel(
      `${pn}-${e}-policyWithChannelsGoldenSignals`,
      {
        policyId: ap.alertPolicyGoldenSignals.id.apply((id) => parseInt(id)),
        channelIds: cids,
      },
      { provider: provider }
    )
    : undefined
}
// Platform Infrastructure alert policy to Platform Infrastructure alert channels
const policyWithChannelsPlatformInfrastructureCritical = ({ e, pn, ap }:
  {
    e: Environments,
    pn: Projects,
    ap: alertPolicy,
  }): newrelic.AlertPolicyChannel | undefined => {
  const cids = getChannelIds({ e: e, pn: pn, alertType: "critical", isPlatformInfra: true })
  return (cids.apply((c) => (c.length != 0)) &&
    ap.alertPolicyPlatformInfrastructureCritical?.id)
    ? new newrelic.AlertPolicyChannel(
      `${pn}-${e}-policyWithChannelsPlatformInfrastructureCritical`,
      {
        policyId: ap.alertPolicyPlatformInfrastructureCritical.id.apply((id) => parseInt(id)),
        channelIds: cids,
      },
      { provider: provider }
    )
    : undefined
}
const policyWithChannelsPlatformInfrastructureInfo = ({ e, pn, ap }:
  {
    e: Environments,
    pn: Projects,
    ap: alertPolicy,
  }): newrelic.AlertPolicyChannel | undefined => {
  const cids = getChannelIds({ e: e, pn: pn, alertType: "info", isPlatformInfra: true })
  return (cids.apply((c) => (c.length != 0)) &&
    ap.alertPolicyPlatformInfrastructureInfo?.id)
    ? new newrelic.AlertPolicyChannel(
      `${pn}-${e}-policyWithChannelsPlatformInfrastructureInfo`,
      {
        policyId: ap.alertPolicyPlatformInfrastructureInfo.id.apply((id) => parseInt(id)),
        channelIds: cids,
      },
      { provider: provider }
    )
    : undefined
}
export const alertPolicyChannels: Array<alertPolicyChannel> =
  flattenAlertReturn<alertPolicyChannel>(projectEnvironments.map((e) =>
    alertPolicies
      .map((ap) => ap)
      .filter((ap) =>
        e == ap.environment)
      .map((ap): alertPolicyChannel =>
      ({
        policyWithChannelsInfo: policyWithChannelsInfo({ e: e, pn: ap.project, ap: ap }),
        policyWithChannelsCritical: policyWithChannelsCritical({ e: e, pn: ap.project, ap: ap }),
        policyWithChannelsGoldenSignals: policyWithChannelsGoldenSignals({ e: e, pn: ap.project, ap: ap }),
        policyWithChannelsPlatformInfrastructureCritical: policyWithChannelsPlatformInfrastructureCritical({ e: e, pn: ap.project, ap: ap }),
        policyWithChannelsPlatformInfrastructureInfo: policyWithChannelsPlatformInfrastructureInfo({ e: e, pn: ap.project, ap: ap }),
        environment: e,
        project: ap.project,
      }))))
