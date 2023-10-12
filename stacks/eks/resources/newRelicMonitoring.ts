import * as k8s from "@pulumi/kubernetes"
import { Namespace } from "@pulumi/kubernetes/core/v1"
import { removeHelmHooksTransformation } from "../../../utility/removeHelmHooksTransformation"
import { config } from "../config/config"
import { eksCluster } from "./eksCluster/eksCluster"

const namespace = new Namespace(
  "newrelic",
  {
    metadata: {
      name: "newrelic",
    },
  },
  { provider: eksCluster.provider }
)

type bundleVersion = {
  v24: string,
  v23: string,
}
const bundleVersions: bundleVersion = {
  v24: "5.0.28",
  v23: "3.0.0",
}
type nriBundleValue = {
  bundleVersion: string,
  bundleValues: {
    "newrelic-infrastructure": { privileged: boolean },
    ksm: { enabled: boolean },
    prometheus: { enabled: boolean },
    kubeEvents: { enabled: boolean },
    logging: { enabled: boolean },
  }
} | {
  bundleVersion: string,
  bundleValues: {
    "newrelic-infrastructure": { privileged: boolean },
    "kube-state-metrics": { enabled: boolean },
    "nri-prometheus": { enabled: boolean },
    "nri-kube-events": { enabled: boolean },
    "newrelic-logging": { enabled: boolean },
  }
}
// Install nri-bundle >=v4 when cluster is 1.24 or higher
// See https://whistle.atlassian.net/browse/DO21-845
const getNewRelicNriBundle = (eksClusterVersion: string): nriBundleValue => {
  const ver: number[] = eksClusterVersion.split(".").map(Number)
  if (ver.length == 2 && ver[1] >= 24) return {
    bundleVersion: bundleVersions.v24, bundleValues: {
      "newrelic-infrastructure": { privileged: true },
      "kube-state-metrics": { enabled: true },
      "nri-prometheus": { enabled: true },
      "nri-kube-events": { enabled: true },
      "newrelic-logging": { enabled: true },
    }
  };
  else return {
    bundleVersion: bundleVersions.v23, bundleValues: {
      "newrelic-infrastructure": { privileged: true },
      ksm: { enabled: true },
      prometheus: { enabled: true },
      kubeEvents: { enabled: true },
      logging: { enabled: true },
    }
  }
}
const bundelVals = getNewRelicNriBundle(config.eksClusterVersion)
export const newRelicMonitoring = new k8s.helm.v3.Chart(
  "new-relic",
  {
    chart: "nri-bundle",
    namespace: namespace.metadata.name,
    version: bundelVals.bundleVersion,
    fetchOpts: {
      repo: "https://helm-charts.newrelic.com",
    },
    values: {
      global: {
        licenseKey: config.NEW_RELIC_LICENSE_KEY,
        cluster: eksCluster.eksCluster.name,
      },
      ...bundelVals.bundleValues
    },
  },
  {
    transformations: [removeHelmHooksTransformation],
    provider: eksCluster.provider,
  }
)
