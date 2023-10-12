import { projectConfiguration } from "./config"
import { petsearchConfig } from "./projects/petsearch"
import { aaprehomesvcConfig } from "./projects/aaprehomesvc"

export const adoptAPetConfigs = (
  (): Array<projectConfiguration> => (
    [
      petsearchConfig(),
      aaprehomesvcConfig(),
    ]
  )
)
