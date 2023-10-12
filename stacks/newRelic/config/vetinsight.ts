import { projectConfiguration } from "./config"
import { vetinsightConfig } from "./projects/vetinsight"

export const vetinsightConfigs = (
  (): Array<projectConfiguration> => (
    [
      vetinsightConfig(),
    ]
  )
)
