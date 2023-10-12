import { ssm } from "@pulumi/aws"
import { NEW_RELIC_BROWSER_KEY, NEW_RELIC_LICENSE_KEY, NEW_RELIC_USER_KEY } from "./src/config"
import { petexecProject } from "./src/petexec"
//import { pefrontendProject } from "./src/pefrontend"
//import { pebackendProject } from "./src/pebackend"

//pefrontendProject
//pebackendProject
petexecProject

// AWS SSM outputs for universal accessibility
;[
    { name: "NEW_RELIC_LICENSE_KEY", value: NEW_RELIC_LICENSE_KEY },
    { name: "NEW_RELIC_BROWSER_KEY", value: NEW_RELIC_BROWSER_KEY },
    { name: "NEW_RELIC_USER_KEY", value: NEW_RELIC_USER_KEY },
  ].map(
    ({ name, value }) =>
      new ssm.Parameter(name, {
        name: `/pulumi/newrelic/${name}`,
        type: "SecureString",
        value: value,
      })
  )
