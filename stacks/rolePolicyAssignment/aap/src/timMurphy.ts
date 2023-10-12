import { RolePolicyAttachment } from "@pulumi/aws/iam"

const policyAttachmentAdminAccess = new RolePolicyAttachment(`AdminAccess-TimMurphy`, {
    role: "tim.murphy",
    policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
})

export const timMurphy = {
    policyAttachmentAdminAccess,
}