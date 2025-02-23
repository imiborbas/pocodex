import { dbg } from 'pocketbase-log'
import { App, PluginConfigured, PluginMeta, SettingsUpdater } from '../../../types'
import { deleteSettings, getSetting, getSettings, setSetting } from './settings'

export const POCODEX_OWNER = `pocodex`
export const RECORD_TYPE_PLUGIN_META = `plugin`

export const getPluginMetas = (app: App) => {
  return getSettings<PluginMeta>(app, POCODEX_OWNER, RECORD_TYPE_PLUGIN_META)
}

export const hasPluginMeta = (app: App, name: string) => {
  return !!getSetting<PluginMeta>(
    app,
    POCODEX_OWNER,
    RECORD_TYPE_PLUGIN_META,
    name
  )
}

export const getPluginMeta = (app: App, name: string) => {
  return getSetting<PluginMeta>(
    app,
    POCODEX_OWNER,
    RECORD_TYPE_PLUGIN_META,
    name,
    newPluginMeta
  ) as PluginMeta
}

export const newPluginMeta = (): PluginMeta => ({ migrations: [] })

export const setPluginMeta = (
  app: App,
  plugin: PluginConfigured,
  update: SettingsUpdater<PluginMeta>
) => {
  setSetting<PluginMeta>(
    app,
    POCODEX_OWNER,
    RECORD_TYPE_PLUGIN_META,
    plugin.name,
    update,
    newPluginMeta
  )
}

export const deletePluginMeta = (app: App, pluginName: string) => {
  deleteSettings(app, POCODEX_OWNER, RECORD_TYPE_PLUGIN_META, pluginName)
}

export const initPluginMeta = (app: App, name: string) => {
  dbg(`Initializing plugin meta for ${name}`)
  setSetting<PluginMeta>(
    app,
    POCODEX_OWNER,
    RECORD_TYPE_PLUGIN_META,
    name,
    (v) => v,
    newPluginMeta
  )
}
