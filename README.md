# github-mirror
Mirror/backup your GitHub data (repos).

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
  -t, --token <token>       GitHub token
  -p, --password <password> Password (instead of token)
  -u, --user <user>         User (defaults to user for token)
  -o, --org <org>           Organization (instead of user)
  -x, --max-repos <max>     Max number of repos
  -n, --no-clone            Don't clone.
  -f, --fresh               Don't cache.

Examples
  $ github-mirror -t ABCDEFG

  $ github-mirror -t ABCDEFG -u AndersDJohnson

  $ github-mirror -t ABCDEFG -o verbose
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
})
```
