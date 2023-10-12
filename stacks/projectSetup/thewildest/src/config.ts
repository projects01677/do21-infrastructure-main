import { StackReference } from "@pulumi/pulumi"

const awsAccountReference = new StackReference("aws-account-thewildest")
export const pulumiStateBucketName = awsAccountReference.getOutput("pulumiStateBucketName").apply(x=>x as string)