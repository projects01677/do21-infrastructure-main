import { Policy, PolicyAttachment, PolicyStatement, User } from "@pulumi/aws/iam"
import { Alias, Key } from "@pulumi/aws/kms"
import { uniq } from "lodash"
import { Projects, userConfig } from "../../../stacks/userConfig"
import { awsAccountId } from "../../awsAccountId"

export const projectSetup = ({
  projectName,
  cicdUserPermissions,
}: {
  projectName: Projects
  cicdUserPermissions: Array<PolicyStatement>
}) => {

  const cicdUser = new User(`${projectName}-cicd-user`, {
    name: `${projectName}-cicd`,
    path: "/service/",
  })

  const midIndex = Math.floor(cicdUserPermissions.length / 2)
  const cicdUserPermissionsArrays = [cicdUserPermissions.slice(0, midIndex), cicdUserPermissions.slice(midIndex)]

  const policyAttachment = cicdUserPermissionsArrays.map((policyStatements, index) => {
    const policy = new Policy(`${projectName}-cicd-policy-${index}`, {
      policy: {
        Version: "2012-10-17",
        Statement: policyStatements,
      },
    })

    return new PolicyAttachment(`${projectName}-cicd-policy-attachment-${index}`, {
      users: [cicdUser],
      policyArn: policy.arn,
    })
  })

  const kmsKey = new Key(`pulumi-${projectName}-infra`, {
    description: `Secrets encryption key for ${projectName} service`,
    customerMasterKeySpec: "SYMMETRIC_DEFAULT",
    policy: cicdUser.arn.apply(async (userArn) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: `arn:aws:iam::${await awsAccountId()}:root`,
            },
            Action: "kms:*",
            Resource: "*",
          },
          {
            Effect: "Allow",
            Principal: {
              AWS: uniq([
                userArn,
                ...userConfig.users
                  .filter((u) => u.memberOfProjects && u.memberOfProjects.indexOf(projectName) != -1)
                  .flatMap((u) =>
                    [
                      u.awsAccess?.whistleSoftware?.iamArn,
                      u.awsAccess?.whistleSoftware?.legacyIamArn,
                      u.awsAccess?.kinshipSharedServices?.roleArn,
                      u.awsAccess?.aapOmega?.roleArn,
                      u.awsAccess?.GoodFriend?.roleArn,
                      u.awsAccess?.vetInsight?.roleArn,
                    ].filter((x) => x != undefined)
                  ),
              ]),
            },
            Action: [
              "kms:DescribeKey",
              "kms:ListResourceTags",
              "kms:ListAliases",
              "kms:Decrypt",
              "kms:Encrypt",
              "kms:GenerateDataKey",
            ],
            Resource: "*",
          },
        ],
      })
    ),
  })

  const kmsAlias = new Alias(`pulumi-${projectName}-infra`, {
    name: `alias/pulumi-${projectName}-infra`,
    targetKeyId: kmsKey.id,
  })

  return {
    cicdUser,
    kmsAlias,
    policyAttachment,
  }
}
