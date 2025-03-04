import { log } from 'pocketbase-log'
import { logo } from './logo'
import { getPluginMetas } from './plugin/meta'

export const ListCommand = () => {
  let listGlobal = false
  const listCommand = new Command({
    use: `list`,
    short: 'List plugins (local and global)',

    run: (cmd, args) => {
      logo()
      const plugins = getPluginMetas($app)
      log('Plugins:')

      plugins.forEach((p) => {
        log(p.key)
      })
      if (plugins.length === 0) {
        log(
          `\tNo pocodex plugins are installed.\n\tUse 'pocketbase x install ---help' to learn how to install plugins.`
        )
      }
    },
  })
  listCommand.flags().boolVar(listGlobal, 'global', 'g', 'List global plugins')
  return listCommand
}
