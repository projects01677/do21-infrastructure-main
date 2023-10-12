import { k8sResourceRoleBinding } from "../stacks/eks/config/config"
export const k8sResourceRoleBindingsFor = (name: string, k8sResourceRoleBindings: Array<k8sResourceRoleBinding> | undefined) : k8sResourceRoleBinding =>
  k8sResourceRoleBindings
  ?.filter((r) => r.name == name)[0]!
