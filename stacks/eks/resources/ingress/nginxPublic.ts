import { LoadBalancer } from "@pulumi/aws/lb"
import { Record } from "@pulumi/aws/route53"
import * as k8s from "@pulumi/kubernetes"
import { Namespace } from "@pulumi/kubernetes/core/v1"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../utility/awsAccountId"
import { awsLoadbalancerArn } from "../../../../utility/awsLoadbalancerArn"
import { removeHelmHooksTransformation } from "../../../../utility/removeHelmHooksTransformation"
import { config } from "../../config/config"
import { eksCluster } from "../eksCluster/eksCluster"
import { whistleRoute53Zone } from "./whistleRoute53Zone"


if (config.ingress.public.externalTrafficPolicy != undefined) {
  var externalTrafficPolicy = config.ingress.public.externalTrafficPolicy
} else {
  var externalTrafficPolicy = ""
}

const namespace = new Namespace(
  "ingress-nginx",
  {
    metadata: {
      name: "ingress-nginx",
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
  "ingress-nginx",
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
          name: config.ingress.public.ingressClass,
          enabled: true,
          controllerValue: `k8s.io/${config.ingress.public.ingressClass}`
        },
        extraArgs: {
          "ingress-class": config.ingress.public.ingressClass, // https://github.com/kubernetes/ingress-nginx/issues/7569
        },
        replicaCount: config.ingress.public.replicaCount,
        config: {
          "log-format-upstream":
            '$remote_addr - $remote_user [$time_local] $ssl_protocol/$ssl_cipher "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time [$proxy_upstream_name] [$proxy_alternative_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id',
          "ssl-ciphers":
            "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:AES128-GCM-SHA256:AES128-SHA256:AES128-SHA:AES256-GCM-SHA384:AES256-SHA256:AES256-SHA",
          "proxy-body-size": config.nginxIngress?.proxyBodySize ? config.nginxIngress.proxyBodySize : "1m",
        },
        service: {
          externalTrafficPolicy: externalTrafficPolicy,
          annotations: {
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

const nlbHostname = nginx.getResource("v1/Service", "ingress-nginx", "ingress-nginx-controller").status.loadBalancer
  .ingress[0].hostname

const loadbalancer = LoadBalancer.get(
  "ingress-load-balancer",
  awsLoadbalancerArn({ awsAccountId: awsAccountId(), lbHostname: nlbHostname })
)

const route53 = new Record("ingress-route53-route", {
  zoneId: whistleRoute53Zone.id,
  type: "A",
  name: `*.${config.ingress.public.route53Subdomain}`,
  aliases: [
    {
      name: loadbalancer.dnsName,
      zoneId: loadbalancer.zoneId,
      evaluateTargetHealth: false,
    },
  ],
})

const baseDomain = interpolate`${config.ingress.public.route53Subdomain}.${whistleRoute53Zone.name}`

export const ingressNginxPublic = {
  nginx,
  route53,
  baseDomain,
  nlbHostname,
  whistleRoute53Zone,
}
