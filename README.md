# github-mirror
> Mirror/backup your GitHub data (repos).

Clones repos to a local directory for backup.

[![npm](https://img.shields.io/npm/v/github-mirror.svg)](https://www.npmjs.com/package/github-mirror)

[![NPM](https://nodei.co/npm/github-mirror.png)](https://nodei.co/npm/github-mirror/)

## Install

```
npm install -g github-mirror
```

## Use

### CLI

```
Usage
  $ github-mirror [options]

Options
  -h, --help                Show this help.
  -d, --dir                 Output directory. Exclude for dry run in GC'd temp dirs.
  -t, --token <token>       GitHub token
  -u, --user <user>         User (defaults to user for token)
  -o, --org <org>           Organization (instead of user)
  -x, --max-repos <max>     Max number of repos
  -n, --dry-run             Dry run.
  -s, --skip-clone          Skip cloning.
  -f, --fresh               Ignore cache.
  -c, --cache               Cache file.

Examples
  # First dry run:
  $ github-mirror -t ABC

  $ github-mirror -t ABC -d ~/Backups/GitHub

  $ github-mirror -t ABC -d ~/Backups/GitHub -u AndersDJohnson

  $ github-mirror -t ABC -d ~/Backups/GitHub -o verbose

  $ github-mirror -t ABC -d ~/Backups/GitHub -x 10
```

### API

```js
#!/usr/bin/env node
require('github-mirror')({
  dir: './data/mirror', // Where to put backups.
  token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // From https://github.com/settings/tokens.
  // maxRepos: 2, // Optional.
  // user: 'AndersDJohnson', // Optional. Defaults to current user.
  // org: 'verbose', // Optional. Instead of `user`.
  // clone: false, // Optional. Defaults to `true`. Whether to clone repos.
  // dryRun: true, // Optional. Defaults to `false`.
  // fresh: true // Optional. Defaults to `false`. Whether to ignore cache.
  // reposFile: './data/repos.json' // Optional. Path to cached repos file.
})
```
