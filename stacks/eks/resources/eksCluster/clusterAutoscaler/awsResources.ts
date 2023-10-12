import * as aws from "@pulumi/aws"
import { Policy, RolePolicyAttachment } from "@pulumi/aws/iam"
import { interpolate } from "@pulumi/pulumi"
import { execSync } from 'child_process'
import { awsAccountId } from "../../../../../utility/awsAccountId"
import { eksCluster } from "../eksCluster"

const eksClusterUrl = eksCluster.eksCluster.identities[0].oidcs[0].issuer
const oidcIssuerId = eksClusterUrl.apply(url => url.substr(url.lastIndexOf('/') + 1))
const role = new aws.iam.Role("AmazonEKSClusterAutoscalerRole", {
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
          "StringEquals": {
            "oidc.eks.us-east-1.amazonaws.com/id/${oidcIssuerId}:sub": "system:serviceaccount:kube-system:cluster-autoscaler"
          }
        }
      }
    ]
  }`
})
const fingerprint = execSync(`echo -n | openssl s_client -servername oidc.eks.us-east-1.amazonaws.com -showcerts -connect oidc.eks.us-east-1.amazonaws.com:443 2>&- | tac | sed -n '/-----END CERTIFICATE-----/,/-----BEGIN CERTIFICATE-----/p; /-----BEGIN CERTIFICATE-----/q' | tac | openssl x509 -fingerprint -noout | sed 's/://g' | awk -F= '{print tolower($2)}'`).toString().trim()
const eksOpenIdConnectProvider = new aws.iam.OpenIdConnectProvider("eksOpenIdConnectProvider", {
  clientIdLists: ["sts.amazonaws.com"],
  thumbprintLists: [fingerprint],
  url: eksClusterUrl,
})
const additionalAutoscalingRolePolicy = new Policy("AmazonEKSClusterAutoscalerPolicy", {
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeLaunchTemplateVersions",
          "ec2:DescribeInstanceTypes",
        ],
        Resource: "*",
      },
    ],
  },
})
const rolePolicyAttachment = new RolePolicyAttachment("additionalAutoscalingRolePolicyAttachment", {
  policyArn: additionalAutoscalingRolePolicy.arn,
  role,
})

export const clusterAutoscalingIam = {
  role,
  eksOpenIdConnectProvider,
  rolePolicyAttachment,
}