import { projectConfiguration } from "./config"
import { gfproviderapiConfig } from "./projects/gfproviderapi"
import { gfwebConfig } from "./projects/gfweb"

export const goodFriendConfigs = (
  (): Array<projectConfiguration> => (
    [
      gfwebConfig(),
      gfproviderapiConfig(),
    ]
  )
)
