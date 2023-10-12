import { Config, Output } from "@pulumi/pulumi"
import {
  awsUnencodedSecretsmanagerValuePlaintext,
  awsUnencodedSecretsmanagerValue,
} from "../../utility/awsSecretsmanagerValue"

export type Configuration = {
  serverDb: {
    host: string
    providerRole: {
      username: Promise<string>
      password: Output<string>
      database: Promise<string>
    }
    serviceRoles: Array<{
      name: string
      password: Output<string>
      /**
       * Creates an AWS Secret Manager entry for legacy applications to use (newer applications will not use this)
       */
      awsSecretManagerNameForPostgresUrl?: string
      awsParameterStoreNameForPostgresUrl?: string
      roleGranted?: string
    }>
    readOnlyRoles: Array<{
      name: string
      password: Output<string>
    }>
  }
}

export const pulumiConfig = new Config()
const environment = pulumiConfig.require("environment")
const postgresProdSuperuserRoleName = "e6cb1ac7aa791f"
const postgresStagingSuperuserRoleName = "f6816e1c5101ef"

export const config: Configuration =
  environment == "staging"
    ? {
        serverDb: {
          host: "server-stg.calrzuaqtp4p.us-east-1.rds.amazonaws.com",
          providerRole: {
            username: awsUnencodedSecretsmanagerValuePlaintext("conf/server/staging/db/username"),
            password: awsUnencodedSecretsmanagerValue("conf/server/staging/db/password"),
            database: awsUnencodedSecretsmanagerValuePlaintext("conf/server/staging/db/name"),
          },
          serviceRoles: [
            {
              name: "server_web",
              password: pulumiConfig.requireSecret("rds_role_server_web_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/staging/db/server_web/postgres_url",
              roleGranted: postgresStagingSuperuserRoleName,
            },
            {
              name: "server_low_worker",
              password: pulumiConfig.requireSecret("rds_role_server_low_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/staging/db/server_low_worker/postgres_url",
              roleGranted: postgresStagingSuperuserRoleName,
            },
            {
              name: "server_high_worker",
              password: pulumiConfig.requireSecret("rds_role_server_high_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/staging/db/server_high_worker/postgres_url",
              roleGranted: postgresStagingSuperuserRoleName,
            },
            {
              name: "server_heavy_worker",
              password: pulumiConfig.requireSecret("rds_role_server_heavy_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/staging/db/server_heavy_worker/postgres_url",
              roleGranted: postgresStagingSuperuserRoleName,
            },
            {
              name: "server_serial_worker",
              password: pulumiConfig.requireSecret("rds_role_server_serial_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/staging/db/server_serial_worker/postgres_url",
              roleGranted: postgresStagingSuperuserRoleName,
            },
            {
              name: "server_scheduler",
              password: pulumiConfig.requireSecret("rds_role_server_scheduler_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/staging/db/server_scheduler/postgres_url",
              roleGranted: postgresStagingSuperuserRoleName,
            },
            {
              name: "logfiles",
              password: pulumiConfig.requireSecret("rds_role_logfiles_password"),
              awsParameterStoreNameForPostgresUrl: "/pulumi/logfiles-staging/POSTGRES_URL",
              roleGranted: postgresStagingSuperuserRoleName,
            },
          ],
          readOnlyRoles: [],
        },
      }
    : environment == "production"
    ? {
        serverDb: {
          host: "server-prod.calrzuaqtp4p.us-east-1.rds.amazonaws.com",
          providerRole: {
            username: awsUnencodedSecretsmanagerValuePlaintext("conf/server/production/db/username"),
            password: awsUnencodedSecretsmanagerValue("conf/server/production/db/password"),
            database: awsUnencodedSecretsmanagerValuePlaintext("conf/server/production/db/name"),
          },
          serviceRoles: [
            {
              name: "server_web",
              password: pulumiConfig.requireSecret("rds_role_server_web_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/production/db/server_web/postgres_url",
              roleGranted: postgresProdSuperuserRoleName,
            },
            {
              name: "server_low_worker",
              password: pulumiConfig.requireSecret("rds_role_server_low_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/production/db/server_low_worker/postgres_url",
              roleGranted: postgresProdSuperuserRoleName,
            },
            {
              name: "server_high_worker",
              password: pulumiConfig.requireSecret("rds_role_server_high_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/production/db/server_high_worker/postgres_url",
              roleGranted: postgresProdSuperuserRoleName,
            },
            {
              name: "server_heavy_worker",
              password: pulumiConfig.requireSecret("rds_role_server_heavy_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/production/db/server_heavy_worker/postgres_url",
              roleGranted: postgresProdSuperuserRoleName,
            },
            {
              name: "server_serial_worker",
              password: pulumiConfig.requireSecret("rds_role_server_serial_worker_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/production/db/server_serial_worker/postgres_url",
              roleGranted: postgresProdSuperuserRoleName,
            },
            {
              name: "server_scheduler",
              password: pulumiConfig.requireSecret("rds_role_server_scheduler_password"),
              awsSecretManagerNameForPostgresUrl: "conf/server/production/db/server_scheduler/postgres_url",
              roleGranted: postgresProdSuperuserRoleName,
            },
            {
              name: "logfiles",
              password: pulumiConfig.requireSecret("rds_role_logfiles_password"),
              awsParameterStoreNameForPostgresUrl: "/pulumi/logfiles-production/POSTGRES_URL",
              roleGranted: postgresProdSuperuserRoleName,
            },
          ],
          readOnlyRoles: [
            {
              name: "airbyte",
              password: pulumiConfig.requireSecret("rds_role_airbyte_password"),
            },
          ],
        },
      }
    : ({} as Configuration)
