import * as core from '@contentlayer/core'
import { errorToString } from '@contentlayer/utils'
import { E, pipe, S, T } from '@contentlayer/utils/effect'
import type { Usage } from 'clipanion'

import { BaseCommand } from './_BaseCommand.js'

export class DevCommand extends BaseCommand {
  static paths = [['dev']]

  static usage: Usage = {
    description: `Same as "contentlayer build" but with watch mode`,
    details: `
      TODO: Longer description 
    `,
    examples: [
      [`Simple run`, `$0 dev`],
      [`Clear cache before run`, `$0 dev --clearCache`],
    ],
  }

  executeSafe = pipe(
    S.suspend(() =>
      core.getConfigWatch({
        configPath: this.configPath,
        cwd: process.cwd(),
      }),
    ),
    S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),
    S.chainSwitchMapEitherRight((source) =>
      core.generateDotpkgStream({ source, verbose: this.verbose, cwd: process.cwd() }),
    ),
    S.tap(E.fold((error) => T.log(errorToString(error)), core.logGenerateInfo)),
    S.runDrain,
  )
}
