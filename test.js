var mirror = require('./src')
var token = require('./token.private.json').token

mirror({
  reposFile: './data/repos.json',
  dir: './data/mirror',
  maxRepos: 2,
  // clone: false,
  token: token
})
