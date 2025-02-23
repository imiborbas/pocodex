import { WritableDraft } from 'immer'
import * as log from 'pocketbase-log'

export type App = PocketBase | core.App

export type SettingsCreator<T> = () => T
export type SettingsUpdater<T> = (value: WritableDraft<T>) => void

export type MigrationFunction = (db: dbx.Builder) => void
export type MigrationSet = { up: MigrationFunction; down: MigrationFunction }
export type PluginConfig = {
  migrate: (up: MigrationFunction, down: MigrationFunction) => MigrationSet
  log: typeof log
  store: <T>(
    key: string,
    updater?: SettingsUpdater<T>,
    creator?: SettingsCreator<T>
  ) => T | null
}

export type Plugin = {
  init?(app: App): void
  install?(app: App): void
  uninstall?(app: App): void
  files?(app: App): Record<string, string>
  migrations?(): { [migrationName: string]: MigrationSet }
}
export type PluginConfigured = Plugin & { name: string }

export type PluginFactory = (config: PluginConfig) => Plugin

export type PluginMeta = {
  migrations: string[]
}
