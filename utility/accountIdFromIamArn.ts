export const accountIdFromIamArn = (arn: string) => arn.match(/.*:.*::(.*):.*/)?.[1]!
