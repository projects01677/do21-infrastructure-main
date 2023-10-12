import { Environments } from "./Environments"
import { AwsAccount } from "../stacks/awsAccount/config"
import { K8sClusterPermission, userConfig } from "../stacks/userConfig"

export const k8sUserArnsFor = ({
  account,
  env,
  clusterPermission,
}: {
  account: AwsAccount
  env: Environments
  clusterPermission: K8sClusterPermission
}) =>
  userConfig.users
    .filter((u) => u.k8sRbac?.[account]?.[env] == clusterPermission)
    .flatMap((u) => [u.awsAccess?.whistleSoftware?.iamArn, u.awsAccess?.whistleSoftware?.legacyIamArn])
    .filter((u) => u != undefined)
    .map((x) => x!)
