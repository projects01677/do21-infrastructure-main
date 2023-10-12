import { Role } from "@pulumi/aws/iam"
import { uniq } from "lodash"
import { accountIdFromIamArn } from "../../../../utility/accountIdFromIamArn"
import { usernameFromIamArn } from "../../../../utility/usernameFromIamArn"
import { config } from "../../config"
import { awsAccount, provider } from "../awsAccount"
import { eksReadOnlyPolicy } from "./policies"

awsAccount.id.apply((accountId) => {
  const roleAccountIds = config.eksUsers
    .flatMap((u) => [
      accountIdFromIamArn(u.awsAccess?.kinshipSharedServices?.roleArn! || "")!,
      accountIdFromIamArn(u.awsAccess?.kinshipDataPlatform?.roleArn! || "")!,
      accountIdFromIamArn(u.awsAccess?.aapOmega?.roleArn! || "")!,
    ].filter((x) => x == accountId))
  const roleArnsWithTheWrongAccountId = roleAccountIds.filter((i) => i != accountId)
  if (roleArnsWithTheWrongAccountId.length > 0) {
    throw new Error(
      `The following user ARN configurations are incorrect: ${roleArnsWithTheWrongAccountId}. The accountId must be ${accountId}`
    )
  }
})
export const userRoles = config.eksUsers.map((u) => {
  const userArn = (u.awsAccess?.whistleSoftware?.iamArn || u.awsAccess?.whistleSoftware?.legacyIamArn)!
  const username = usernameFromIamArn(userArn)
  const roleNamesWithTheWrongUsername = [
    {
      username: usernameFromIamArn(u.awsAccess?.kinshipSharedServices?.roleArn! || ""),
      arn: u.awsAccess?.kinshipSharedServices?.roleArn!
    },
    {
      username: usernameFromIamArn(u.awsAccess?.kinshipDataPlatform?.roleArn! || ""),
      arn: u.awsAccess?.kinshipDataPlatform?.roleArn!
    },
    {
      username: usernameFromIamArn(u.awsAccess?.aapOmega?.roleArn! || ""),
      arn: u.awsAccess?.aapOmega?.roleArn!
    },
  ]
    .filter((x) => x.arn != undefined && x.username != username)
  if (roleNamesWithTheWrongUsername.length > 0) {
    throw new Error(
      `The following Role names are incorrect:`
      + JSON.stringify(roleNamesWithTheWrongUsername)
      + ` The Role name must match ${username}`
    )
  }
  return new Role(
    username,
    {
      name: username,
      inlinePolicies: [{ name: eksReadOnlyPolicy.name, policy: eksReadOnlyPolicy.policy }],
      managedPolicyArns: ["arn:aws:iam::aws:policy/ReadOnlyAccess"],
      assumeRolePolicy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: userArn,
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
    },
    { provider: provider }
  )
})
