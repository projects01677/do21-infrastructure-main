import { Namespace } from "@pulumi/kubernetes/core/v1"
import { ClusterRole, ClusterRoleBinding, Role, RoleBinding } from "@pulumi/kubernetes/rbac/v1"
import { config } from "../../config/config"
import { eksCluster } from "../eksCluster/eksCluster"
import { usernameFromIamArn } from "../../../../utility/usernameFromIamArn"
import { viewOnlyName } from "./viewOnlyName"
import { uniq } from "lodash"

const viewOnlyClusterRole = new ClusterRole(
  viewOnlyName,
  {
    metadata: {
      name: viewOnlyName
    },
    rules: [
      {
        apiGroups: ["*"],
        resources: ["*"],
        verbs: ["get", "watch", "list"],
      },
    ],
  },
  { provider: eksCluster.provider }
)

const viewOnly = new ClusterRoleBinding(
  viewOnlyName,
  {
    subjects: [
      {
        kind: "Group",
        name: viewOnlyName,
      },
    ],
    roleRef: {
      kind: "ClusterRole",
      name: viewOnlyClusterRole.metadata.name,
      apiGroup: "rbac.authorization.k8s.io",
    },
  },
  { provider: eksCluster.provider }
)

const namespaceAdminRbac = (namespaceName: string, iamArns: Array<string>) => {
  const namespace = new Namespace(
    namespaceName,
    {
      metadata: {
        name: namespaceName,
      },
    },
    { provider: eksCluster.provider }
  )

  const role = new Role(
    `${namespaceName}-admin`,
    {
      metadata: {
        name: `${namespaceName}-admin`,
        namespace: namespace.metadata.name,
      },
      rules: [
        {
          apiGroups: ["*"],
          resources: ["*"],
          verbs: ["*"],
        },
      ],
    },
    { provider: eksCluster.provider }
  )

  const roleBindings = uniq(iamArns
    .map((arn) => usernameFromIamArn(arn)))
    .map(
      (username) =>
        new RoleBinding(
          `${namespaceName}-${username}`,
          {
            metadata: {
              name: username,
              namespace: namespace.metadata.name,
            },
            subjects: [
              {
                kind: "User",
                name: username,
                namespace: namespace.metadata.name,
              },
            ],
            roleRef: {
              kind: "Role",
              name: role.metadata.name,
              apiGroup: "rbac.authorization.k8s.io",
            },
          },
          { provider: eksCluster.provider }
        )
    )

  return {
    namespace,
    role,
    roleBindings,
  }
}

export const eksClusterRoleBindings = {
  viewOnly,
  namespaceAdmins: config.k8sNamespaces.map((x) => namespaceAdminRbac(x.name, [...x.adminArns.users, ...x.adminArns.roles])),
}
