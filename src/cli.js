#!/usr/bin/env node

/**
 * github-mirror -t `json -f token.private.json token` -n -x 2
 */

const meow = require('meow')
const mirror = require('.')

const cli = meow(`
  Usage
    $ github-mirror [options]

  Options
    -t, --token <token>       GitHub token
    -p, --password <password> Password (instead of token)
    -u, --user <user>         User (defaults to user for token)
    -o, --org <org>           Organization (instead of user)
    -x, --max-repos <max>     Max number of repos
    -n, --no-clone            Don't clone.

  Examples
    $ github-mirror -t ABCDEFG

    $ github-mirror -t ABCDEFG -u AndersDJohnson

    $ github-mirror -t ABCDEFG -o verb

`, {
  alias: {
    h: 'help'
  }
})

var flags = cli.flags

mirror({
  reposFile: './data/repos-cli.json',
  dir: './data/mirror-cli',
  maxRepos: flags.x,
  clone: ! flags.c,
  token: flags.t
})
