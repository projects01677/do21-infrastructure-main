import {
  Policy,
  RolePolicyAttachment,
  PolicyStatement,
  Role,
} from "@pulumi/aws/iam"
import { awsAccountId } from "../../awsAccountId"
import { interpolate } from "@pulumi/pulumi"
import { Projects } from "../../../stacks/userConfig"

export const iamRoleEKSsa = ({
  projectName,
  eksSaPermissions,
  environment,
  oidcIssuerId,
  serviceAccountNamespace,
  serviceAccountName,
}: {
  projectName: Projects
  eksSaPermissions: Array<PolicyStatement>
  environment: string
  oidcIssuerId: Promise<string>
  serviceAccountNamespace: string
  serviceAccountName: string
}) => {
  const eksSaPolicy = new Policy(
    `${projectName}-eksSrviceAccountRolePolicy-${environment}`,
    {
      name: `${projectName}-eksSrviceAccountRolePolicy-${environment}`,
      policy: {
        Version: "2012-10-17",
        Statement: eksSaPermissions,
      },
    }
  )

  const eksSaRole = new Role(
    `${projectName}-AmazonEKSserviceAccountRole-${environment}`,
    {
      name: `${projectName}-eksSrviceAccountRole-${environment}`,
      assumeRolePolicy: interpolate`{
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Federated": "arn:aws:iam::${awsAccountId()}:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/${oidcIssuerId}"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                  "StringLike": {
                    "oidc.eks.us-east-1.amazonaws.com/id/${oidcIssuerId}:sub": "system:serviceaccount:${serviceAccountNamespace}:${serviceAccountName}*"
                  }
                }
              }
            ]
          }`,
    }
  )

  const eksSaRolePolicyAttachment = new RolePolicyAttachment(
    `${projectName}-serviceAccountRolePolicyAttachment-${environment}`,
    {
      role: eksSaRole,
      policyArn: eksSaPolicy.arn,
    }
  )

  return {
    eksSaRole,
    eksSaRolePolicyAttachment,
  }
}
