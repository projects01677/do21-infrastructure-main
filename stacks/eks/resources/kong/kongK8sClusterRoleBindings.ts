import { ClusterRole, ClusterRoleBinding, Role, RoleBinding } from "@pulumi/kubernetes/rbac/v1"
import { eksCluster } from "../eksCluster/eksCluster"
import { config } from "../../config/config"
import { usernameFromIamArn } from "../../../../utility/usernameFromIamArn"
import { k8sResourceRoleBindingsFor } from "../../../../utility/k8sResourceRoleBindingsFor"
const kongResourceClusterRoleBinding = (config.k8sResourceRoleBindings != undefined ) ? ()=> {
const kongBinding = k8sResourceRoleBindingsFor("kong-ingress-controller",config.k8sResourceRoleBindings)
const ingressClusterRole = new ClusterRole(
  kongBinding?.name,
  {
    metadata: {
      name: kongBinding?.name
    },
    rules: [
      {
        apiGroups: ["extensions", "networking.k8s.io",],
        resources: ["ingresses", "ingressclasses",],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["apiextensions.k8s.io"],
        resources: ["customresourcedefinitions"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["rbac.authorization.k8s.io"],
        resources: ["clusterroles", "clusterrolebindings",],
        verbs: ["get", "list", "watch", "create","delete",],
      },
      {
        apiGroups: ["admissionregistration.k8s.io"],
        resources: ["validatingwebhookconfigurations"],
        verbs: ["get", "list", "watch", "create","delete","patch",],
      },
      {
        apiGroups: [""],
        resources: ["endpoints"],
        verbs: ["list", "watch",],
      },
      {
        apiGroups: [""],
        resources: ["endpoints/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: [""],
        resources: ["events"],
        verbs: ["create", "patch",],
      },
      {
        apiGroups: [""],
        resources: ["nodes"],
        verbs: ["list", "watch",],
      },
      {
        apiGroups: [""],
        resources: ["pods"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: [""],
        resources: ["secrets"],
        verbs: ["list", "watch",],
      },
      {
        apiGroups: [""],
        resources: ["secrets/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: [""],
        resources: ["services"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: [""],
        resources: ["services/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongclusterplugins"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongclusterplugins/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongconsumers"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongconsumers/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongingresses"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongingresses/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongplugins"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["kongplugins/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["tcpingresses"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["tcpingresses/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["udpingresses"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["configuration.konghq.com"],
        resources: ["udpingresses/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["extensions"],
        resources: ["ingresses"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["extensions"],
        resources: ["ingresses/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["networking.internal.knative.dev"],
        resources: ["ingresses"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["networking.internal.knative.dev"],
        resources: ["ingresses/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["networking.k8s.io"],
        resources: ["ingresses"],
        verbs: ["get", "list", "watch",],
      },
      {
        apiGroups: ["networking.k8s.io"],
        resources: ["ingresses/status"],
        verbs: ["get", "patch", "update",],
      },
      {
        apiGroups: ["apiextensions.k8s.io"],
        resources: ["customresourcedefinitions"],
        verbs: ["create"],
      },
    ],
  },
  { provider: eksCluster.provider }
)

const ingressClusterRoleBinding = new ClusterRoleBinding(
  kongBinding?.name,
  {
    kind: "ClusterRoleBinding",
    metadata: {
      name: ingressClusterRole.metadata.name,
    },
    roleRef: {
      kind: "ClusterRole",
      name: ingressClusterRole.metadata.name,
      apiGroup: "rbac.authorization.k8s.io",
    },
    subjects: [{
      kind: "User",
      name: usernameFromIamArn(kongBinding?.userArn),
      namespace: kongBinding?.namespace,
      apiGroup: "rbac.authorization.k8s.io",
    }],
  },
  { provider: eksCluster.provider }
)
return {
  ingressClusterRole,
  ingressClusterRoleBinding,
}
} : ()=> { return undefined }
export const kongClusterRoleBindings = {
  kongResourceClusterRoleBinding
}
