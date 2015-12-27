# github-mirror
Mirror/backup your GitHub data.

## Use

A CLI is coming, but for now from a Node.js script:

```js
#!/usr/bin/env node
require('github-mirror')({
  dir: './data/mirror', // Where to put backups.
  token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // From https://github.com/settings/tokens.
  // maxRepos: 2, // Optional,
  // user: 'AndersDJohnson' // Optional, defaults to current user.
  // org: 'verb' // Optional, instead of `user`.
})
```
