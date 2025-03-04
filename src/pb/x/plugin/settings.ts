import { produce } from 'immer'
import { dbg } from 'pocketbase-log'
import { stringify } from 'pocketbase-stringify'
import { App, SettingsCreator, SettingsUpdater } from '../../../types'

export const getSetting = <T>(
  app: App,
  owner: string,
  type?: string,
  key?: string,
  defaultValue?: SettingsCreator<T>
): T | null => {
  const setting =
    getSettings<T>(app, owner, type, key)[0]?.value ??
    (defaultValue?.() || null)
  dbg(`Fetched setting ${owner}:${type}:${key}`, { setting })
  return setting
}

export const getSettings = <T>(
  app: App,
  owner: string,
  type?: string,
  key?: string
): { owner: string; type: string; key: string; value: T }[] => {
  const expressions = [$dbx.exp(`owner = {:owner}`, { owner })]
  if (type) {
    expressions.push($dbx.exp(`type = {:type}`, { type }))
  }
  if (key) {
    expressions.push($dbx.exp(`key = {:key}`, { key }))
  }
  const records = app.findAllRecords('pocodex', ...expressions)
  dbg(`Fetched settings ${owner}:${type}:${key}`, { records })

  return records
    .filter((r): r is core.Record => !!r)
    .map((record) => ({
      owner: record.get(`owner`),
      type: record.get(`type`),
      key: record.get(`key`),
      value: JSON.parse(record.get(`value`)) as T,
    }))
}

export const setSetting = <T>(
  app: App,
  owner: string,
  type: string,
  key: string,
  updater: SettingsUpdater<T>,
  creator: SettingsCreator<T>
) => {
  let finalValue = null as T
  app.runInTransaction((txApp: core.App) => {
    try {
      dbg(`Attempting to update setting ${owner}:${type}:${key}`)
      const record = txApp.findFirstRecordByFilter(
        'pocodex',
        'owner = {:owner} && type = {:type} && key = {:key}',
        { owner, type, key }
      )
      dbg(`Found setting ${owner}:${type}:${key}`, { record })
      const newValue = produce(JSON.parse(record.get('value')) as T, updater)
      dbg(`Updating setting ${owner}:${type}:${key}`, {
        oldValue: record,
        newValue,
      })
      record.set('value', stringify(newValue))
      txApp.save(record)
      finalValue = newValue as T
      dbg(`Updated setting ${owner}:${type}:${key}`, { record })
    } catch (e) {
      if (!`${e}`.match(/no rows/)) {
        throw e
      }
      dbg(`Creating setting ${owner}:${type}:${key}`)
      try {
        const collection = txApp.findCollectionByNameOrId('pocodex')

        const newValue = produce(creator(), updater)
        const record = new Record(collection, {
          owner,
          type,
          key,
          value: stringify(newValue),
        })

        txApp.save(record)
        dbg(`Created setting ${owner}:${type}:${key}`, { record })
        finalValue = newValue
      } catch (e) {
        dbg(`Error saving setting ${owner}:${type}:${key}`)
        dbg(e)
        throw e
      }
    }
  })
  return finalValue
}

export const deleteSettings = (
  app: App,
  owner: string,
  type?: string,
  key?: string
) => {
  try {
    const expressions = [$dbx.exp(`owner = {:owner}`, { owner })]
    if (type) {
      expressions.push($dbx.exp(`type = {:type}`, { type }))
    }
    if (key) {
      expressions.push($dbx.exp(`key = {:key}`, { key }))
    }
    app.runInTransaction((txApp: core.App) => {
      dbg(`Deleting settings ${owner}:${type}:${key}`)
      const records = app.findAllRecords('pocodex', ...expressions)
      records
        .filter((r): r is core.Record => !!r)
        .forEach((record) => {
          dbg(
            `Deleting setting ${record.get('owner')}:${record.get('type')}:${record.get('key')}`
          )
          try {
            txApp.delete(record)
          } catch (e) {
            dbg(`Error deleting setting ${owner}:${type}:${key}: ${e}`)
            dbg(e)
            throw e
          }
        })
    })
    dbg(`Deleted settings ${owner}:${type}:${key}`)
  } catch (e) {
    dbg(`Error deleting setting ${owner}:${type}:${key}: ${e}`)
    dbg(e)
    throw e
  }
}
