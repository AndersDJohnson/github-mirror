#!/usr/bin/env node

/**
 * github-mirror -t `json -f token.private.json token` -n -x 2 -f
 */

const meow = require('meow')
const mirror = require('.')

const cli = meow(`
  Usage
    $ github-mirror [options]

  Options
    -h, --help                Show this help.
    -d, --dir                 Output directory.
    -t, --token <token>       GitHub token
    -p, --password <password> Password (instead of token)
    -u, --user <user>         User (defaults to user for token)
    -o, --org <org>           Organization (instead of user)
    -x, --max-repos <max>     Max number of repos
    -n, --no-clone            Don't clone.
    -f, --fresh               Don't cache.
    -c, --cache               Cache file.

  Examples
    $ github-mirror -t ABCDEFG

    $ github-mirror -t ABCDEFG -u AndersDJohnson

    $ github-mirror -t ABCDEFG -o verbose

`, {
  alias: {
    h: 'help'
  }
})

var flags = cli.flags

mirror({
  reposFile: flags.c, // e.g. './data/repos-cli.json'
  dir: flags.d || process.cwd(), // e.g. './data/mirror-cli'
  maxRepos: flags.x,
  clone: ! flags.n,
  token: flags.t,
  org: flags.o,
  user: flags.u,
  password: flags.p,
  fresh: flags.f
})
