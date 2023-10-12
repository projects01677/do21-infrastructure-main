import { Config } from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"
import { Policy, RolePolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { awsAccountId } from "../../../../utility/awsAccountId"
import { eksCluster } from "../eksCluster/eksCluster"
import { config } from "../../config/config"

const environment = new Config().get("environment")
const eksClusterUrl = eksCluster.eksCluster.identities[0].oidcs[0].issuer
const oidcIssuerId = eksClusterUrl.apply(url => url.substr(url.lastIndexOf('/') + 1))
const projectName = "petsearch"

const serviceAccountRolePolicyBinding = (config.iamRoleServiceAccount != undefined ) ? ()=> {
const serviceAccountRole = new aws.iam.Role(`AmazonEKSserviceAccountRole`, {
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
              "oidc.eks.us-east-1.amazonaws.com/id/${oidcIssuerId}:sub": "system:serviceaccount:${config.iamRoleServiceAccount?.serviceAccountNamespace}*:${config.iamRoleServiceAccount?.serviceAccountName}*"
            }
          }
        }
      ]
    }`
})
  
const serviceAccountRolePolicy = new Policy("AmazonEKSserviceAccountRolePolicy", {
  name: `${projectName}-eksSrviceAccountRolePolicy-${environment}`,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "s3:GetObject",
          "s3:PutObject"
        ],
        Resource: [
          interpolate`arn:aws:s3:::${projectName}-assets-${environment}/*`,
          interpolate`arn:aws:s3:::adopt-a-pet-project-omega-assets-${environment}/*`,
          "arn:aws:s3:::petsearch-assets-release/*",
          "arn:aws:s3:::pet-uploads.staging.adoptapet.com/*",
          "arn:aws:s3:::pet-uploads.adoptapet.com/*"
        ]
      },
      {
        Effect: "Allow",
        Action: [
          "s3:ListBucket",
        ],
        Resource: [
          interpolate`arn:aws:s3:::${projectName}-assets-${environment}`,
          interpolate`arn:aws:s3:::adopt-a-pet-project-omega-assets-${environment}`,
          "arn:aws:s3:::petsearch-assets-release",
          "arn:aws:s3:::pet-uploads.staging.adoptapet.com",
          "arn:aws:s3:::pet-uploads.adoptapet.com"
        ]
      },
      {
        Effect: "Allow",
        Action: [
          "sqs:SendMessage",
        ],
        Resource: [
          interpolate`arn:aws:sqs:*:${awsAccountId()}:${projectName}-npa-queue-${environment}*`,
          `arn:aws:sqs:us-east-1:069716362557:staging-ra-queue`,
          `arn:aws:sqs:us-east-1:069716362557:ra-queue`
        ]
      },
    ],
  },
})

  
const serviceAccountRolePolicyAttachment = new RolePolicyAttachment("serviceAccountRolePolicyAttachment", {
  policyArn: serviceAccountRolePolicy.arn,
  role: serviceAccountRole,
})

return {
  serviceAccountRole,
  serviceAccountRolePolicy,
  serviceAccountRolePolicyAttachment
}
} : ()=> { return undefined }


export const iamRoleServiceAccount = {
  serviceAccountRolePolicyBinding
}
