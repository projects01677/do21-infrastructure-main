import { Output } from "@pulumi/pulumi"

export const formatKeyValuePairsForK8sEnvVar = (kvps: {
  [key: string]: string | number | boolean | Promise<string> | Output<string>
}) =>
  Object.keys(kvps).map((key) => {
    const value = kvps[key]
    return {
      name: key,
      value: typeof value === "number" || typeof value === "boolean" ? `${value}` : value,
    }
  })

export const reverseFormatKeyValuePairsForK8sEnvVar = (
  envVars: Array<{ name: string; value: string }>
): { [key: string]: string } =>
  envVars.reduce(
    (prev, curr) => ({
      ...prev,
      ...{ [curr.name]: curr.value },
    }),
    {}
  )
