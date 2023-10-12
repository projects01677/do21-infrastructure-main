import { Projects, userConfig } from "../stacks/userConfig"

export const iamRolesPartOfProject = (projectName: Projects) =>
  userConfig.users
    .filter(
      (u) =>
        u.memberOfProjects &&
        u.memberOfProjects.indexOf(projectName) != -1 &&
        (u.awsAccess?.whistleSoftware?.iamArn || u.awsAccess?.whistleSoftware?.legacyIamArn)
    )
    .flatMap((u) => [
      u.awsAccess?.kinshipSharedServices?.roleArn,
      u.awsAccess?.kinshipDataPlatform?.roleArn,
      u.awsAccess?.aapOmega?.roleArn,
    ])
    .filter((x) => x != undefined)
    .map((x) => x!)
