import { Policy, RolePolicyAttachment, PolicyStatement } from "@pulumi/aws/iam"

export const rolePolicyAssignmment = ({
  policyName,
  role,
  userPermissions,
}: {
  policyName: string
  role: string
  userPermissions: Array<PolicyStatement>
}) => {
  const policy = new Policy(policyName, {
    name: policyName,
    policy: {
      Version: "2012-10-17",
      Statement: userPermissions,
    },
    tags: {
      managed_by: "Pulumi",
    },
  })

  const policyAttachmen = new RolePolicyAttachment(
    `${policyName}-${role}`,
    {
      role: role,
      policyArn: policy.arn,
    }
  )

  return {
    policyAttachmen
  }
}
