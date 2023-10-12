import { StorageClass } from "@pulumi/kubernetes/storage/v1"
import { eksCluster } from "./eksCluster/eksCluster"

export const storageClassEbs = new StorageClass(
  "gp2-improved",
  {
    apiVersion: "storage.k8s.io/v1",
    kind: "StorageClass",
    metadata: {
      name: "gp2-improved",
    },
    parameters: {
      fsType: "ext4",
      type: "gp2",
    },
    provisioner: "kubernetes.io/aws-ebs",
    reclaimPolicy: "Delete",
    volumeBindingMode: "WaitForFirstConsumer",
    allowVolumeExpansion: true,
  },
  { provider: eksCluster.provider }
)
