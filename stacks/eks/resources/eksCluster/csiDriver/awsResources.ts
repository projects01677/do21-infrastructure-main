import { interpolate } from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"
import { awsAccountId } from "../../../../../utility/awsAccountId"
import { eksCluster } from "../../eksCluster/eksCluster"
import { config } from "../../../config/config"

const amazonEBSCSIDriverPolicyArn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
const eksClusterUrl = eksCluster.eksCluster.identities[0].oidcs[0].issuer
const oidcIssuerId = eksClusterUrl.apply((url) =>
  url.substr(url.lastIndexOf("/") + 1)
)
export const ebsCSIDriverIRSA =
  config.eksAddons?.ebsCSIDriver !== undefined
    ? () => {
        const eksEBSCSIRole = new aws.iam.Role("eksEBSCSIDriverRole", {
          name: `AmazonEKS_EBS_CSI_DriverRole-${config.envName}`,
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
              "oidc.eks.us-east-1.amazonaws.com/id/${oidcIssuerId}:sub": "system:serviceaccount:kube-system:ebs-csi-controller-sa"
            }
          }
        }
      ]
    }`,
        })

        const eksEBSCSIRolePolicyAttachment = new aws.iam.RolePolicyAttachment(
          "ebsCSIRolePolicyAttachment",
          {
            policyArn: amazonEBSCSIDriverPolicyArn,
            role: eksEBSCSIRole,
          }
        )

        return {
          eksEBSCSIRole,
        }
      }
    : () => {
        return undefined
      }
