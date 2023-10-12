import { Policy } from "@pulumi/aws/iam"

export const assumeRolePolicy = new Policy("assume-role", {
  name: "assume-role",
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["sts:AssumeRole"],
        Resource: "*",
      },
      {
        Effect: "Deny",
        Action: ["sts:*"],
        Resource: "arn:aws:iam::*:role/OrganizationAccountAccessRole",
      },
    ],
  },
})
