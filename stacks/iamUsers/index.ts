import { User, UserGroupMembership } from "@pulumi/aws/iam"
import { accountIdFromIamArn } from "../../utility/accountIdFromIamArn"
import { awsAccountId } from "../../utility/awsAccountId"
import { usernameFromIamArn } from "../../utility/usernameFromIamArn"
import { userConfig } from "../userConfig"
import { basicUserGroup } from "./basicUserGroup"

const config = {
  iamUserArns: userConfig.users
    .filter((u) => u.awsAccess?.whistleSoftware?.iamArn)
    .map((u) => u.awsAccess?.whistleSoftware?.iamArn!),
}

awsAccountId().then((accountId) => {
  const userAccountIds = config.iamUserArns.map(accountIdFromIamArn)
  const userArnsWithTheWrongAccountId = userAccountIds.filter((i) => i != accountId)
  if (userArnsWithTheWrongAccountId.length > 0) {
    throw new Error(
      `The following user ARN configurations are incorrect: ${userArnsWithTheWrongAccountId}. The accountId must be ${accountId}`
    )
  }
})

export const iamUsers = config.iamUserArns.map((arn) => {
  const username = usernameFromIamArn(arn)
  const user = new User(username, { name: username })
  const groupMemberships = new UserGroupMembership(username, { user: user.name, groups: [basicUserGroup.name] })
  return user
})
