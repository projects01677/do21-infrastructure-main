import { getRegion } from "@pulumi/aws"
import { AccessKey, Policy, PolicyAttachment, User } from "@pulumi/aws/iam"
import * as k8s from "@pulumi/kubernetes"
import { CustomResource } from "@pulumi/kubernetes/apiextensions"
import { Namespace, Secret } from "@pulumi/kubernetes/core/v1"
import { Config, interpolate, StackReference } from "@pulumi/pulumi"
import { removeHelmHooksTransformation } from "../../utility/removeHelmHooksTransformation"

const kongIngressName = new Config().get("kongIngressName") as string
const eksStack = new StackReference(new Config().get("eksStackName") as string)
const eksProvider = new k8s.Provider("k8s", {
  kubeconfig: eksStack.getOutput("kubeConfig"),
})
const ingressDomainInternal = eksStack.getOutput("ingressDomainInternal")
const ingressInternalHostedZoneId = eksStack.getOutput(
  "ingressInternalHostedZoneId"
)

const eksStackName = new Config().get("eksStackName") as string
const certManagerVersion = "1.10.2"

const namespace = new Namespace(
  "cert-manager",
  {
    metadata: {
      name: "cert-manager",
    },
  },
  { provider: eksProvider }
)

const chart = new k8s.helm.v3.Chart(
  "cert-manager",
  {
    chart: "cert-manager",
    namespace: namespace.metadata.name,
    version: certManagerVersion,
    fetchOpts: {
      repo: "https://charts.jetstack.io",
    },
    values: {
      installCRDs: true,
    },
  },
  {
    transformations: [removeHelmHooksTransformation],
    provider: eksProvider,
  }
)

const letsencryptClusterIssuer = new CustomResource(
  "letsencryptClusterIssuer",
  {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
      name: "letsencrypt",
      namespace: namespace.metadata.name,
    },
    spec: {
      acme: {
        email: "devops@whistle.com",
        server: "https://acme-v02.api.letsencrypt.org/directory",
        preferredChain: "ISRG Root X1",
        privateKeySecretRef: {
          name: "letsencrypt-issuer-account-key",
        },
        solvers: [
          {
            http01: {
              ingress: {
                class: "nginx",
              },
            },
          },
        ],
      },
    },
  },
  {
    provider: eksProvider,
    dependsOn: chart.resources.apply((m) => Object.values(m)),
  }
)

const policy = new Policy("letsencryptDns01ClusterIssuerPolicy", {
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "route53:GetChange",
        Resource: "arn:aws:route53:::change/*",
      },
      {
        Effect: "Allow",
        Action: [
          "route53:ChangeResourceRecordSets",
          "route53:ListResourceRecordSets",
        ],
        Resource: interpolate`arn:aws:route53:::hostedzone/${ingressInternalHostedZoneId}`,
      },
      {
        Effect: "Allow",
        Action: "route53:ListHostedZonesByName",
        Resource: "*",
      },
    ],
  },
})

const user = new User("letsencryptDns01ClusterIssuerUser", {
  name: interpolate`${eksStack.name}-letsencrypt-dns01-cluster-issuer`.apply(
    (s) => s.substr(0, 64)
  ),
  path: "/service/",
})

const policyAttachment = new PolicyAttachment(
  "letsencryptDns01ClusterIssuerUserPolicyAttachment",
  {
    users: [user],
    policyArn: policy.arn,
  }
)

const accessKey = new AccessKey("letsencryptDns01ClusterIssuerUserAccessKey", {
  user: user.name,
})

const secretKeyRefName = "AWS_SECRET_ACCESS_KEY"
const secret = new Secret(
  "letsencryptDns01ClusterIssuerUserSecret",
  {
    metadata: {
      name: "dns01-cluster-issuer",
      namespace: namespace.metadata.name,
    },
    stringData: {
      [secretKeyRefName]: accessKey.secret,
    },
  },
  { provider: eksProvider }
)

const letsencryptClusterIssuerDns01 = new CustomResource(
  "letsencryptDns01ClusterIssuer",
  {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
      name: "letsencrypt-dns01",
      namespace: namespace.metadata.name,
    },
    spec: {
      acme: {
        email: "devops@whistle.com",
        server: "https://acme-v02.api.letsencrypt.org/directory",
        privateKeySecretRef: {
          name: "letsencrypt-dns01-issuer-account-key",
        },
        solvers: [
          {
            selector: {
              dnsZones: [ingressDomainInternal],
            },
            dns01: {
              route53: {
                region: getRegion().then((x) => x.name),
                hostedZoneId: ingressInternalHostedZoneId,
                accessKeyID: accessKey.id,
                secretAccessKeySecretRef: {
                  name: secret.metadata.name,
                  key: secretKeyRefName,
                },
              },
            },
          },
        ],
      },
    },
  },
  {
    provider: eksProvider,
    dependsOn: chart.resources.apply((m) => Object.values(m)),
  }
)

const letsencryptClusterIssuerKong = kongIngressName
  ? new CustomResource(
      "letsencryptClusterIssuerKong",
      {
        apiVersion: "cert-manager.io/v1",
        kind: "ClusterIssuer",
        metadata: {
          name: "letsencrypt-kong",
          namespace: namespace.metadata.name,
        },
        spec: {
          acme: {
            email: "devops@whistle.com",
            server: "https://acme-v02.api.letsencrypt.org/directory",
            preferredChain: "ISRG Root X1",
            privateKeySecretRef: {
              name: "letsencrypt-issuer-account-key",
            },
            solvers: [
              {
                http01: {
                  ingress: {
                    class: kongIngressName,
                  },
                },
              },
            ],
          },
        },
      },
      {
        provider: eksProvider,
        dependsOn: chart.resources.apply((m) => Object.values(m)),
      }
    )
  : undefined
