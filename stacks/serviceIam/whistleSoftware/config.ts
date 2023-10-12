import { Config, StackReference } from "@pulumi/pulumi"
import { Environments } from "../../../utility/Environments"

type Configuration = {
  apolloServiceUserS3BucketName: string
  logfiles: {
    bucketName: string
    dynamodbTableName: string
  }
  serverDataProcessor: {
    dynamodbTableNames: Array<string>
  }
}

export const environment = new Config().get("environment") as Environments
export const whistleProjectSetupStackReference = new StackReference("whistle-project-setup")

export const config: Configuration =
  environment == "staging"
    ? {
        apolloServiceUserS3BucketName: "whistle-server-staging",
        logfiles: {
          bucketName: "logfiles-stg-ue1-svcs-logs",
          dynamodbTableName: "logfiles-stg",
        },
        serverDataProcessor: {
          dynamodbTableNames: [
            "point_entries-stg",
            "whistle-staging-petinsight-data",
          ],
        },
      }
    : environment == "production"
    ? {
        apolloServiceUserS3BucketName: "whistle-server-production",
        logfiles: {
          bucketName: "logfiles-prod-ue1-svcs-logs",
          dynamodbTableName: "logfiles-prod",
        },
        serverDataProcessor: {
          dynamodbTableNames: [
            "point_entries-prod",
            "whistle-production-petinsight-data",
          ],
        },
      }
    : ({} as Configuration)
