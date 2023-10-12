import { Deployment } from "@pulumi/kubernetes/apps/v1"
import { ServiceAccount } from "@pulumi/kubernetes/core/v1"
import {
  ClusterRole,
  ClusterRoleBinding, Role, RoleBinding
} from "@pulumi/kubernetes/rbac/v1"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../../utility/awsAccountId"
import { eksCluster } from "../eksCluster"
import { clusterAutoscalingIam } from "./awsResources"
import { config } from "../../../config/config"

const serviceAccount = new ServiceAccount(
  "cluster-autoscaler",
  {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
      labels: {
        "k8s-addon": "cluster-autoscaler.addons.k8s.io",
        "k8s-app": "cluster-autoscaler",
      },
      annotations: {
        "eks.amazonaws.com/role-arn": interpolate`arn:aws:iam::${awsAccountId()}:role/${clusterAutoscalingIam.role.name}`,
      },
      name: "cluster-autoscaler",
      namespace: "kube-system",
    },
  },
  { provider: eksCluster.provider }
)

const clusterRole = new ClusterRole(
  "cluster-autoscaler",
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRole",
    metadata: {
      name: "cluster-autoscaler",
      labels: {
        "k8s-addon": "cluster-autoscaler.addons.k8s.io",
        "k8s-app": "cluster-autoscaler",
      },
    },
    rules: [
      {
        apiGroups: [""],
        resources: ["events", "endpoints"],
        verbs: ["create", "patch"],
      },
      {
        apiGroups: [""],
        resources: ["pods/eviction"],
        verbs: ["create"],
      },
      {
        apiGroups: [""],
        resources: ["pods/status"],
        verbs: ["update"],
      },
      {
        apiGroups: [""],
        resources: ["endpoints"],
        resourceNames: ["cluster-autoscaler"],
        verbs: ["get", "update"],
      },
      {
        apiGroups: [""],
        resources: ["nodes"],
        verbs: ["watch", "list", "get", "update"],
      },
      {
        apiGroups: [""],
        resources: [
          "pods",
          "services",
          "replicationcontrollers",
          "persistentvolumeclaims",
          "persistentvolumes",
          "namespaces",
        ],
        verbs: ["watch", "list", "get"],
      },
      {
        apiGroups: ["extensions"],
        resources: ["replicasets", "daemonsets"],
        verbs: ["watch", "list", "get"],
      },
      {
        apiGroups: ["policy"],
        resources: ["poddisruptionbudgets"],
        verbs: ["watch", "list"],
      },
      {
        apiGroups: ["apps"],
        resources: ["statefulsets", "replicasets", "daemonsets"],
        verbs: ["watch", "list", "get"],
      },
      {
        apiGroups: ["storage.k8s.io"],
        resources: ["storageclasses", "csinodes", "csidrivers", "csistoragecapacities"],
        verbs: ["watch", "list", "get"],
      },
      {
        apiGroups: ["batch", "extensions"],
        resources: ["jobs"],
        verbs: ["get", "list", "watch", "patch"],
      },
      {
        apiGroups: ["coordination.k8s.io"],
        resources: ["leases"],
        verbs: ["create"],
      },
      {
        apiGroups: ["coordination.k8s.io"],
        resourceNames: ["cluster-autoscaler"],
        resources: ["leases"],
        verbs: ["get", "update"],
      },
    ],
  },
  { provider: eksCluster.provider }
)

const role = new Role(
  "cluster-autoscaler",
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: {
      name: "cluster-autoscaler",
      namespace: "kube-system",
      labels: {
        "k8s-addon": "cluster-autoscaler.addons.k8s.io",
        "k8s-app": "cluster-autoscaler",
      },
    },
    rules: [
      {
        apiGroups: [""],
        resources: ["configmaps"],
        verbs: ["create", "list", "watch"],
      },
      {
        apiGroups: [""],
        resources: ["configmaps"],
        resourceNames: [
          "cluster-autoscaler-status",
          "cluster-autoscaler-priority-expander",
        ],
        verbs: ["delete", "get", "update", "watch"],
      },
    ],
  },
  { provider: eksCluster.provider }
)

const clusterRoleBinding = new ClusterRoleBinding(
  "cluster-autoscaler",
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "ClusterRoleBinding",
    metadata: {
      name: "cluster-autoscaler",
      labels: {
        "k8s-addon": "cluster-autoscaler.addons.k8s.io",
        "k8s-app": "cluster-autoscaler",
      },
    },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "ClusterRole",
      name: "cluster-autoscaler",
    },
    subjects: [
      {
        kind: "ServiceAccount",
        name: "cluster-autoscaler",
        namespace: "kube-system",
      },
    ],
  },
  { provider: eksCluster.provider }
)

const roleBinding = new RoleBinding(
  "cluster-autoscaler",
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: {
      name: "cluster-autoscaler",
      namespace: "kube-system",
      labels: {
        "k8s-addon": "cluster-autoscaler.addons.k8s.io",
        "k8s-app": "cluster-autoscaler",
      },
    },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "Role",
      name: "cluster-autoscaler",
    },
    subjects: [
      {
        kind: "ServiceAccount",
        name: "cluster-autoscaler",
        namespace: "kube-system",
      },
    ],
  },
  { provider: eksCluster.provider }
)

const deployment = new Deployment(
  "cluster-autoscaler",
  {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "cluster-autoscaler",
      namespace: "kube-system",
      labels: {
        app: "cluster-autoscaler",
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "cluster-autoscaler",
        },
      },
      template: {
        metadata: {
          labels: {
            app: "cluster-autoscaler",
          },
          annotations: {
            "prometheus.io/scrape": "true",
            "prometheus.io/port": "8085",
            "cluster-autoscaler.kubernetes.io/safe-to-evict": "false",
          },
        },
        spec: {
          serviceAccountName: "cluster-autoscaler",
          containers: [
            {
              image: `registry.k8s.io/autoscaling/cluster-autoscaler:v${config.clusterAutoscalerVersion}`,
              name: "cluster-autoscaler",
              resources: {
                limits: {
                  cpu: "100m",
                  memory: "1Gi",
                },
                requests: {
                  cpu: "100m",
                  memory: "500Mi",
                },
              },
              command: [
                "./cluster-autoscaler",
                "--v=4",
                "--stderrthreshold=info",
                "--cloud-provider=aws",
                "--skip-nodes-with-local-storage=false",
                "--expander=least-waste",
                interpolate`--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/${eksCluster.eksCluster.name}`,
                "--balance-similar-node-groups",
                "--skip-nodes-with-system-pods=false",
              ],
              volumeMounts: [
                {
                  name: "ssl-certs",
                  mountPath: "/etc/ssl/certs/ca-certificates.crt",
                  readOnly: true,
                },
              ],
              imagePullPolicy: "Always",
            },
          ],
          volumes: [
            {
              name: "ssl-certs",
              hostPath: {
                path: "/etc/ssl/certs/ca-bundle.crt",
              },
            },
          ],
        },
      },
    },
  },
  { provider: eksCluster.provider }
)

export const eksClusterAutoscaler = {
  serviceAccount,
  clusterRole,
  role,
  clusterRoleBinding,
  roleBinding,
  deployment,
  clusterAutoscalingIam,
}
