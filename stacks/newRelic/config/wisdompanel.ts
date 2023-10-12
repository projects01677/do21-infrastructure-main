import { projectConfiguration } from "./config"
import { wpwisdomsvcConfig } from "./projects/wpwisdomsvc"

export const wisdomPanelConfigs = (
  (): Array<projectConfiguration> => (
    [
      wpwisdomsvcConfig(),
    ]
  )
)
