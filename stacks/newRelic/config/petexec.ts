import { projectConfiguration } from "./config"
import { pefrontendConfig } from "./projects/pefrontend"
import { pebackendConfig } from "./projects/pebackend"

export const petExecConfigs = (
  (): Array<projectConfiguration> => (
    [
      pefrontendConfig(),
      pebackendConfig(),
    ]
  )
)
