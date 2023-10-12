import { getSecretVersion, getSecret } from "@pulumi/aws/secretsmanager"
import { secret } from "@pulumi/pulumi"

export const awsUnencodedSecretsmanagerValuePlaintext = (name: string) =>
  getSecret({ name }).then((s) =>
    getSecretVersion({ secretId: s.arn }).then((sv) => Buffer.from(sv.secretString, "base64").toString("ascii").trim())
  )

export const awsUnencodedSecretsmanagerValue = (name: string) => secret(awsUnencodedSecretsmanagerValuePlaintext(name))
