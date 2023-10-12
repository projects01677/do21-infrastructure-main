import { Environments } from "./Environments"
import { AwsAccount } from "../stacks/awsAccount/config"
import { K8sClusterPermission, userConfig } from "../stacks/userConfig"

export const k8sRoleArnsFor = ({
  account,
  env,
  clusterPermission,
}: {
  account: Exclude<AwsAccount, "whistleSoftware">
  env: Environments
  clusterPermission: K8sClusterPermission
}) =>
  userConfig.users
    .filter((u) => u.k8sRbac?.[account]?.[env] == clusterPermission)
    .map((u) => u.awsAccess?.[account]?.roleArn)
    .filter((r) => r != undefined)
    .map((r) => r!)
