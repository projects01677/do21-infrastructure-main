import * as k8s from "@pulumi/kubernetes"
import { eksCluster } from "./eksCluster/eksCluster"
import { config } from "../config/config"
type chartVersion = {
  v24: string,
  v23: string,
}
const chartVersions: chartVersion = {
  v24: "0.6.4",
  v23: "0.5.1",
}
const clusterVerArr: number[] = config.eksClusterVersion.split(".").map(Number)
const chartVersion = clusterVerArr.length == 2 && clusterVerArr[1] >= 24 ? chartVersions.v24 : chartVersions.v23

export const metricsServer = new k8s.yaml.ConfigFile(
  "metrics-server",
  {
    file: `https://github.com/kubernetes-sigs/metrics-server/releases/download/v${chartVersion}/components.yaml`,
  },
  { provider: eksCluster.provider }
)
