import { Repository, RepositoryPolicy } from "@pulumi/aws/ecr"
import * as docker from "@pulumi/docker"
import { Deployment } from "@pulumi/kubernetes/apps/v1"
import { Service } from "@pulumi/kubernetes/core/v1"
import { Ingress } from "@pulumi/kubernetes/networking/v1"
import * as pulumi from "@pulumi/pulumi"
import { interpolate } from "@pulumi/pulumi"
import { hashElement } from "folder-hash"
import { awsAccountId } from "../../../../utility/awsAccountId"
import { config } from "../../config/config"
import { eksCluster } from "../eksCluster/eksCluster"
import { ingressNginxInternal } from "../ingress/nginxInternal"
import { ingressNginxPublic } from "../ingress/nginxPublic"
import { port } from "./app/port"

const repo = new Repository("maintenance-page", {
  name: `whistle/maintenance-page/${config.envName}`,
})

const repoPolicy = awsAccountId().then((id) =>
  id == "419697633145"
    ? undefined
    : new RepositoryPolicy("root-account-push-pull", {
        repository: repo.name,
        policy: {
          Version: "2008-10-17",
          Statement: [
            {
              Sid: "AllowPushPull",
              Effect: "Allow",
              Principal: {
                AWS: `arn:aws:iam::419697633145:root`,
              },
              Action: [
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
              ],
            },
          ],
        },
      })
)

const myImage = new docker.Image("maintenance-page", {
  imageName: interpolate`${repo.repositoryUrl}:${hashElement("app", __dirname, {
    encoding: "hex",
    folders: { exclude: ["node_modules"] },
  }).then((hash) => hash.hash)}`,
  build: {
    context: `resources/maintenancePage/app`,
    dockerfile: `resources/maintenancePage/app/Dockerfile`,
  },
})

export const namespace = "default"
const labels = { app: "maintenance-page" }
const deployment = new Deployment(
  "maintenance-page",
  {
    metadata: {
      name: "maintenance-page",
      namespace: namespace,
    },
    spec: {
      replicas: config.maintenancePageReplicas,
      selector: {
        matchLabels: labels,
      },
      template: {
        metadata: {
          labels: labels,
        },
        spec: {
          containers: [
            {
              name: "maintenance-page",
              image: myImage.imageName.apply((_) => myImage.baseImageName),
              ports: [
                {
                  containerPort: port,
                },
              ],
              resources: {
                requests: {
                  memory: "256Mi",
                },
              },
            },
          ],
        },
      },
    },
  },
  { provider: eksCluster.provider }
)

const service = new Service(
  "maintenance-page",
  {
    metadata: {
      labels: deployment.metadata.labels,
      name: "maintenance-page",
      namespace: namespace,
    },
    spec: {
      selector: deployment.spec.selector.matchLabels,
      ports: [
        {
          port: 80,
          targetPort: deployment.spec.template.spec.containers[0].ports[0].containerPort,
        },
      ],
    },
  },
  { provider: eksCluster.provider }
)

const domain = pulumi.interpolate`maintenance.${ingressNginxPublic.baseDomain}`
const publicIngress = new Ingress(
  "maintenance-page",
  {
    metadata: {
      name: "maintenance-page",
      namespace: namespace,
      annotations: {
        "kubernetes.io/ingress.class": config.ingress.public.ingressClass,
        "cert-manager.io/cluster-issuer": "letsencrypt",
      },
    },
    spec: {
      rules: [
        {
          host: domain,
          http: {
            paths: [
              {
                path: "/",
                pathType: "Prefix",
                backend: {
                  service: {
                    name: service.metadata.name,
                    port: {
                      number: service.spec.ports[0].port,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
      tls: [
        {
          hosts: [domain],
          secretName: "maintenance-page-tls-cert",
        },
      ],
    },
  },
  { provider: eksCluster.provider }
)

export const internalDomain = pulumi.interpolate`maintenance.${ingressNginxInternal.baseDomain}`
export const internalTlsSecretName = "maintenance-page-internal-tls-cert"
const internalIngress = new Ingress(
  "maintenance-page-internal",
  {
    metadata: {
      name: "maintenance-page-internal",
      namespace: namespace,
      annotations: {
        "kubernetes.io/ingress.class": config.ingress.internal.ingressClass,
        "cert-manager.io/cluster-issuer": "letsencrypt-dns01", // This depends on the eks-cert-manager stack being deployed
      },
    },
    spec: {
      rules: [
        {
          host: internalDomain,
          http: {
            paths: [
              {
                path: "/",
                pathType: "Prefix",
                backend: {
                  service: {
                    name: service.metadata.name,
                    port: {
                      number: service.spec.ports[0].port,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
      tls: [
        {
          hosts: [internalDomain],
          secretName: internalTlsSecretName,
        },
      ],
    },
  },
  { provider: eksCluster.provider }
)

export const maintenancePageApp = {
  deployment,
  publicIngress,
  internalIngress,
  service,
}
