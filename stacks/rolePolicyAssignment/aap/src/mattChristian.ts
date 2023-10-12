import { RolePolicyAttachment } from "@pulumi/aws/iam"

const policyAttachmentAdminAccess = new RolePolicyAttachment(`AdminAccess-MattChristian`, {
    role: "matt.christian",
    policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
})

export const mattChristian = {
    policyAttachmentAdminAccess,
}
