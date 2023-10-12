import { ssm } from "@pulumi/aws"
import { Output, secret } from "@pulumi/pulumi"

export const formatKeyValuePairsForK8sEnvVar = (kvps: {
  [key: string]: string | number | boolean | Promise<string> | Output<string>
}) =>
  Object.keys(kvps).map((key) => {
    const value = kvps[key]
    return {
      name: key,
      value:
        typeof value === "number" || typeof value === "boolean"
          ? `${value}`
          : value,
    }
  })

export const awsSsmParam = (name: string) =>
  ssm.getParameter({ name }).then((s) => s.value)

export const awsSsmSecret = (name: string) =>
  awsSsmParam(name).then((s) => secret(s))
