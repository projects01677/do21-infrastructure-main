import { AccessKey, Policy, User, UserPolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { environment } from "./environment"

const policy = new Policy("pe-backend", {
    name: interpolate`pe-backend-${environment}`,
    policy: {
        Version: "2012-10-17",
        Statement: [
            {
                Sid: "OkPetExecGoodFriendSqsPolicy",
                Effect: "Allow",
                Action: [
                    "sqs:SendMessage",
                    "sqs:ReceiveMessage",
                    "sqs:DeleteMessage",
                    "sqs:GetQueueAttributes",
                    "sqs:ChangeMessageVisibility"
                ],
                Resource: "arn:aws:sqs:us-east-1:575036886166:ok-*"
            },
            {
                Sid: "S3Access",
                Effect: "Allow",
                Action: [
                    "s3:ListMultipartUploads",
                    "s3:ListBuckets",
                    "s3:GetBucketLocation",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    "s3:ListObjectsV2",
                    "s3:GetObject",
                    "s3:PutObjectAcl",
                    "s3:GetObjectAcl",
                    "s3:ListObjects"
                ],
                Resource: "*"
            },
            {
                Sid: "CloudFrontAccess",
                Effect: "Allow",
                Action: [
                    "cloudfront:ListDistributions",
                ],
                Resource: "*"
            },
            {
                Sid: "LambdaAccess",
                Effect: "Allow",
                Action: [
                    "lambda:ListFunctions20150331"
                ],
                Resource: "*"
            },
            {
                Sid: "kmsAccess",
                Effect: "Allow",
                Action: [
                    "kms:Decrypt",
                    "kms:Encrypt",
                    "kms:CreateAlias",
                    "kms:CreateKey",
                    "kms:DeleteAlias",
                    "kms:Describe*",
                    "kms:GenerateRandom",
                    "kms:Get*",
                    "kms:List*",
                    "kms:TagResource",
                    "kms:UntagResource",
                    "iam:ListGroups",
                    "iam:ListRoles",
                    "iam:ListUsers"
                ],
                Resource: "*"
            },
        ],
    },
})

const user = new User("pe-backend", {
    name: interpolate`pe-backend-${environment}`,
})

const policyAttachment = new UserPolicyAttachment(`pe-backend`, {
    user: user,
    policyArn: policy.arn,
})

const accessKey = new AccessKey("pe-backend", {
    user: user.name,
})

export const peBackendIam = {
    user,
    policyAttachment,
    accessKey,
}
