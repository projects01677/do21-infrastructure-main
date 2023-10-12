import * as aws from "@pulumi/aws"
import { config } from "../../config"
import { provider } from "../awsAccount"

const tableName = `${config.name.replace(/ /g, "-").toLowerCase()}-terraform-state`

export const terraformDynamoDBLockTable = new aws.dynamodb.Table(tableName, {
  name: tableName,
  attributes: [
      {
          name: "LockID",
          type: "S",
      }
  ],
  billingMode: "PROVISIONED",
  hashKey: "LockID",
  readCapacity: 10,
  tags: {
      Environment: "production",
      Name: tableName,
      Managed_by: "Pulumi"
  },
  writeCapacity: 10,
},
{ provider: provider, protect: true }
)