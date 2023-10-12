import * as aws from "@pulumi/aws"
import { SecretVersion } from "@pulumi/aws/secretsmanager"
import * as pg from "@pulumi/postgresql"
import { interpolate, Output } from "@pulumi/pulumi"
import { config } from "./config"
import * as ssm from "@pulumi/aws/ssm"

const serverWebProvider = config.serverDb.providerRole.username.then((username) => ({
  host: config.serverDb.host,
  provider: new pg.Provider("server", {
    host: config.serverDb.host,
    username,
    password: config.serverDb.providerRole.password,
    superuser: false,
  }),
}))

const pgRoleWithAwsSecretPassword = ({
  roleName,
  roleGranted,
  password,
  secretName,
  awsParameterStoreNameForPostgresUrl,
  databaseToGrantPrivilegesOn,
  pgProvider,
}: {
  roleGranted?: string
  roleName: string
  password: Output<string>
  secretName?: string
  awsParameterStoreNameForPostgresUrl?: string
  databaseToGrantPrivilegesOn: string
  pgProvider: { host: string; provider: pg.Provider }
}) => {
  const role = new pg.Role(
    roleName,
    {
      name: roleName,
      password: password,
      login: true,
      inherit: true,
      roles: roleGranted ? [roleGranted] : [],
    },
    { provider: pgProvider.provider }
  )
  const grants = ["table", "sequence"].map(
    (objectType) =>
      new pg.Grant(
        `${roleName}-${objectType}`,
        {
          database: databaseToGrantPrivilegesOn,
          objectType: objectType,
          schema: "public",
          privileges: ["ALL"],
          role: role.name,
        },
        {
          provider: pgProvider.provider,
          ignoreChanges: ["privileges"], // This grant only applies to existing tables. This ignore ensures it only runs once since future tables will be handled by the Role.role property
        }
      )
  )
  const awsSecret =
    secretName != undefined
      ? new aws.secretsmanager.Secret(secretName, { name: secretName }, { deleteBeforeReplace: true })
      : undefined
  const awsSecretVersion =
    awsSecret != undefined && secretName != undefined
      ? new SecretVersion(
          secretName,
          {
            secretId: awsSecret.id,
            secretString: interpolate`postgres://${roleName}:${password}@${pgProvider.host}:5432/${databaseToGrantPrivilegesOn}`,
          },
          { deleteBeforeReplace: true }
        )
      : undefined

  const awsParameterStoreEntry =
    awsParameterStoreNameForPostgresUrl != undefined
      ? new ssm.Parameter(awsParameterStoreNameForPostgresUrl, {
          name: awsParameterStoreNameForPostgresUrl,
          type: "SecureString",
          value: interpolate`postgres://${roleName}:${password}@${pgProvider.host}:5432/${databaseToGrantPrivilegesOn}`,
        })
      : undefined

  return {
    role,
    awsSecret,
    awsSecretVersion,
    awsParameterStoreEntry,
    grants,
  }
}

const serverDbCredsForServices = config.serverDb.serviceRoles.map((a) =>
  Promise.all([config.serverDb.providerRole.database, serverWebProvider]).then(([database, pgProvider]) =>
    pgRoleWithAwsSecretPassword({
      roleName: a.name,
      roleGranted: a.roleGranted,
      password: a.password,
      secretName: a.awsSecretManagerNameForPostgresUrl,
      awsParameterStoreNameForPostgresUrl: a.awsParameterStoreNameForPostgresUrl,
      databaseToGrantPrivilegesOn: database,
      pgProvider,
    })
  )
)

config.serverDb.readOnlyRoles.map(({ name, password }) =>
  Promise.all([config.serverDb.providerRole.database, serverWebProvider]).then(([database, pgProvider]) => {
    const readOnlyRole = new pg.Role(
      name,
      {
        name: name,
        password: password,
        login: true,
      },
      { provider: pgProvider.provider }
    )
    const grants = ["table", "sequence"].map(
      (objectType) =>
        new pg.Grant(
          `${name}-${objectType}`,
          {
            database,
            objectType,
            schema: "public",
            privileges: ["SELECT"],
            role: readOnlyRole.name,
          },
          {
            provider: pgProvider.provider,
            ignoreChanges: ["privileges"], // This grant only applies to existing tables when it is applied. If new tables are added, remove this line and run again.
          }
        )
    )
  })
)
