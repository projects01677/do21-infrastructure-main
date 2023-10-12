import { RolePolicyAttachment } from "@pulumi/aws/iam"

const policyAttachmentAdminAccess = new RolePolicyAttachment(`AdminAccess-OmarReyes`, {
    role: "omar.reyes",
    policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
})

export const omarReyes = {
    policyAttachmentAdminAccess,
}
