import * as log from 'pocketbase-log'
import { App, PluginConfigured, PluginFactory } from '../../../types'
import { getSetting, setSetting } from './settings'

export const loadPlugin = (app: App, pluginName: string) => {
  const configuredModule = loadPluginSafeMode(app, pluginName)
  configuredModule.init?.(app)
  return configuredModule
}

const PLUGIN_STORE_RECORD_TYPE = `setting`
export const loadPluginSafeMode = (app: App, pluginName: string) => {
  const module = require(`${pluginName}/dist/plugin`)
  const factory = (module.default || module.plugin || module) as PluginFactory
  if (typeof factory !== 'function') {
    throw new Error(`Plugin ${pluginName} does not export a factory function`)
  }
  const pluginModule = factory({
    migrate: (up, down) => ({
      up,
      down,
    }),
    log,
    store: (key, updater, creator) => {
      if (updater) {
        if (!creator) {
          throw new Error(`Updating the store requires a creator function`)
        }
        return setSetting(
          app,
          pluginName,
          PLUGIN_STORE_RECORD_TYPE,
          key,
          updater,
          creator
        )
      } else {
        return getSetting(app, pluginName, PLUGIN_STORE_RECORD_TYPE, key)
      }
    },
  })
  const configuredModule: PluginConfigured = {
    name: pluginName,
    ...pluginModule,
  }
  return configuredModule
}
