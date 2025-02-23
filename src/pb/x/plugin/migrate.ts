import { forEach, keys } from '@s-libs/micro-dash'
import { dbg, log, warn } from 'pocketbase-log'
import { App, PluginConfigured } from '../../../types'
import { getPluginMeta, setPluginMeta } from './meta'

export const migrateUp = (app: App, plugin: PluginConfigured) => {
  log(`Running up migrations for plugin ${plugin.name}`)
  const value = getPluginMeta(app, plugin.name)
  const migrations = plugin.migrations?.()

  dbg(`Found migrations:`, keys(migrations))
  forEach(migrations, (migration, name) => {
    dbg(`Checking migration ${name}`)
    if (value.migrations.includes(name)) {
      dbg(`Skipping migration ${name} because it has already been applied`)
      return
    }
    log(`Running migration ${name}`)
    app.runInTransaction((txApp) => {
      dbg(`Running up migration ${name}`)
      migration.up(txApp.db())
      dbg(`Updating meta with migration ${name}`)
      setPluginMeta(txApp, plugin, (meta) => {
        dbg(`Adding migration ${name} to meta`, { meta })
        meta.migrations.push(name)
      })
    })
  })
}

export const migrateDown = (app: App, plugin: PluginConfigured) => {
  dbg(`Running down migrations for plugin ${plugin.name}`)
  const meta = getPluginMeta(app, plugin.name)
  const migrations = plugin.migrations?.()

  meta?.migrations?.reverse().forEach((name) => {
    const migration = migrations?.[name]
    if (!migration) {
      warn(`Migration ${name} not found - skipping downgrade`)
    }
    dbg(`Running down migration ${name}`)
    app.runInTransaction((txApp: core.App) => {
      migration!.down(txApp.db())
      dbg(`Removing migration  ${name} from meta`)
      setPluginMeta(txApp, plugin, (meta) => {
        meta.migrations = meta.migrations.filter((m) => m !== name)
      })
    })
  })
}
