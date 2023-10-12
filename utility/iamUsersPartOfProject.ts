import { Projects, userConfig } from "../stacks/userConfig"

export const iamUsersPartOfProject = (projectName: Projects) =>
  userConfig.users
    .filter(
      (u) =>
        u.memberOfProjects &&
        u.memberOfProjects.indexOf(projectName) != -1 &&
        (u.awsAccess?.whistleSoftware?.iamArn || u.awsAccess?.whistleSoftware?.legacyIamArn)
    )
    .flatMap((u) => [u.awsAccess?.whistleSoftware?.iamArn, u.awsAccess?.whistleSoftware?.legacyIamArn])
    .filter((x) => x != undefined)
    .map((x) => x!)
