import { LoadBalancer } from "@pulumi/aws/alb"
import { Record, Zone } from "@pulumi/aws/route53"
import * as k8s from "@pulumi/kubernetes"
import { Namespace } from "@pulumi/kubernetes/core/v1"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../utility/awsAccountId"
import { awsLoadbalancerArn } from "../../../../utility/awsLoadbalancerArn"
import { removeHelmHooksTransformation } from "../../../../utility/removeHelmHooksTransformation"
import { config } from "../../config/config"
import { eksCluster } from "../eksCluster/eksCluster"
import { whistleRoute53Zone } from "./whistleRoute53Zone"

const namespace = new Namespace(
  "ingress-nginx-internal",
  {
    metadata: {
      name: "ingress-nginx-internal",
    },
  },
  { provider: eksCluster.provider }
)
type chartVersion = {
  v24: string,
  v23: string,
}
const chartVersions: chartVersion = {
  v24: "4.7.1",
  v23: "4.0.3",
}
const clusterVerArr: number[] = config.eksClusterVersion.split(".").map(Number)
const chartVersion = clusterVerArr.length == 2 && clusterVerArr[1] >= 24 ? chartVersions.v24 : chartVersions.v23

const nginx = new k8s.helm.v3.Chart(
  "ingress-nginx-internal",
  {
    chart: "ingress-nginx",
    namespace: namespace.metadata.name,
    version: chartVersion,
    fetchOpts: {
      repo: "https://kubernetes.github.io/ingress-nginx",
    },
    values: {
      controller: {
        ingressClassByName: true,
        ingressClassResource: {
          name: config.ingress.internal.ingressClass,
          enabled: true,
          controllerValue: `k8s.io/${config.ingress.internal.ingressClass}`
        },
        extraArgs: {
          "ingress-class": config.ingress.internal.ingressClass, // https://github.com/kubernetes/ingress-nginx/issues/7569
        },
        replicaCount: config.ingress.internal.replicaCount,
        service: {
          annotations: {
            "service.beta.kubernetes.io/aws-load-balancer-internal": "true",
            "service.beta.kubernetes.io/aws-load-balancer-type": "nlb",
            "service.beta.kubernetes.io/aws-load-balancer-backend-protocol": "tcp",
            "service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled": "true",
          },
        },
      },
    },
  },
  {
    transformations: [removeHelmHooksTransformation],
    provider: eksCluster.provider,
  }
)

const loadbalancer = LoadBalancer.get(
  "ingress-load-balancer-internal",
  awsLoadbalancerArn({
    awsAccountId: awsAccountId(),
    lbHostname: nginx.getResource("v1/Service", "ingress-nginx-internal", "ingress-nginx-internal-controller").status
      .loadBalancer.ingress[0].hostname,
  })
)

const baseDomain = interpolate`${config.ingress.internal.route53Subdomain}.${whistleRoute53Zone.name}`

const internalZone = new Zone("internal-zone", {
  name: baseDomain,
})

const nsRecord = new Record("ns-record-in-master-zone", {
  name: config.ingress.internal.route53Subdomain,
  zoneId: whistleRoute53Zone.id,
  type: "NS",
  ttl: 86400,
  records: internalZone.nameServers,
})

const route53Record = new Record("ingress-route53-route-internal", {
  zoneId: internalZone.id,
  type: "A",
  name: `*`,
  aliases: [
    {
      name: loadbalancer.dnsName,
      zoneId: loadbalancer.zoneId,
      evaluateTargetHealth: false,
    },
  ],
})

export const ingressNginxInternal = {
  nginx,
  internalZone,
  nsRecord,
  baseDomain,
  route53Record,
}
