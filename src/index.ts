#!/usr/bin/env node
import { command, number, option, run, string } from 'cmd-ts'
import { serve } from './cmd/serve'
import { getHostname } from './util/network'

const cmd = command({
  name: 'serve',
  description: 'Serve HPUB',
  args: {
    glob: option({ short: 'g', long: 'Glob Path to match', type: string, defaultValue: () => '**/*.hpub' }),
    hostname: option({ short: 'h', long: 'Hostname', type: string, defaultValue: () => getHostname() }),
    port: option({ short: 'p', long: 'Port', type: number, defaultValue: () => 8989 })
  },
  handler: (args) => {
    serve(args)
  }
})

run(cmd, process.argv.slice(2))
