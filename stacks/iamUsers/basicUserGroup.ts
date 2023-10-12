import { Group, GroupPolicyAttachment } from "@pulumi/aws/iam"
import { output } from "@pulumi/pulumi"
import { manageOwnCredentialsPolicy } from "../../utility/projectSetup/iamPolicies/manageOwnCredentialsPolicy"
import { eksReadOnlyPolicy } from "../../utility/projectSetup/iamPolicies/eksReadOnlyPolicy"
import { assumeRolePolicy } from "../../utility/projectSetup/iamPolicies/assumeRolePolicy"

export const basicUserGroup = new Group("basic-user", { name: "basic-user" })

const groupPolicyAttachments = [manageOwnCredentialsPolicy, eksReadOnlyPolicy, assumeRolePolicy]
  .map((policy) =>
    policy.name.apply(
      (policyName) =>
        new GroupPolicyAttachment(policyName, {
          group: basicUserGroup,
          policyArn: policy.arn,
        })
    )
  )
  .concat(
    output(
      new GroupPolicyAttachment("ReadOnlyAccess", {
        group: basicUserGroup,
        policyArn: "arn:aws:iam::aws:policy/ReadOnlyAccess",
      })
    )
  )
