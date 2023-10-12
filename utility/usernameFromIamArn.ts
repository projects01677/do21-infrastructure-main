export const usernameFromIamArn = (arn: string) => arn.match(/[^\/]+$/)?.[0]!
