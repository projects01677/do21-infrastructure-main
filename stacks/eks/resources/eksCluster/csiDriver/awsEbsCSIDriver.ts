import * as k8s from "@pulumi/kubernetes"
import { removeHelmHooksTransformation } from "../../../../../utility/removeHelmHooksTransformation"
import { eksCluster } from "../../eksCluster/eksCluster"
import { ebsCSIDriverIRSA } from "./awsResources"
import { config } from "../../../config/config"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../../utility/awsAccountId"
type chartVersion = {
  v24: string,
  v23: string,
}
const chartVersions: chartVersion = {
  v24: "2.22.0",
  v23: "2.16.0",
}
const clusterVerArr: number[] = config.eksClusterVersion.split(".").map(Number)
const chartVersion = clusterVerArr.length == 2 && clusterVerArr[1] >= 24 ? chartVersions.v24 : chartVersions.v23
export const eksEBSCSIDriver = config.eksAddons?.ebsCSIDriver
  ? new k8s.helm.v3.Chart(
      "aws-ebs-csi-driver",
      {
        chart: "aws-ebs-csi-driver",
        namespace: "kube-system",
        version: chartVersion,
        fetchOpts: {
          repo: "https://kubernetes-sigs.github.io/aws-ebs-csi-driver",
        },
        values: {
          controller: {
            serviceAccount: {
              annotations: {
                "eks.amazonaws.com/role-arn": interpolate`arn:aws:iam::${awsAccountId()}:role/${ebsCSIDriverIRSA()?.eksEBSCSIRole.name}`,
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
  : undefined
