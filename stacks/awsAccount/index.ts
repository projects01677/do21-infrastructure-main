import { awsAccount } from "./src/awsAccount"
import { pulumiStateBucket } from "./src/accountResources/pulumiStateBucket"
import { terraformStateBucket } from "./src/accountResources/terraformStateBucket"
import { terraformDynamoDBLockTable } from "./src/accountResources/terraformDynamoDBLockTable"
import { userRoles } from "./src/accountResources/roles"

userRoles

export const awsAccountId = awsAccount.id
export const pulumiStateBucketName = pulumiStateBucket.bucket
export const terraformStateBucketName = terraformStateBucket.bucket
export const terrafformDynamoDBLockTableName = terraformDynamoDBLockTable.name