// https://github.com/philschatz/octokat.js
// https://developer.github.com/v3/

var Promise = require('es6-promise').Promise
var Octokat = require('octokat')
var mkdirp = require('mkdirp')
var jsonfile = require('jsonfile')
var path = require('path')
var gift = require('gift')
var assert = require('assert')
var _ = require('lodash')
var temp = require('temp')
var fs = require('fs')
var getSize = require('get-folder-size')
var filesize = require('file-size')
var PromiseSeries = require('promise-series')
var promiseRecurse = require('promise-recurse').promiseRecurse

temp = temp.track()

module.exports = run

function run (options) {

  options = options || {}
  options.dir = options.dir || temp.mkdirSync('github-mirror-')
  options.clone = options.hasOwnProperty('clone') ? options.close : true
  options.ownerType = options.ownerType || 'users' // or 'orgs'

  if (options.user) {
    options.owner = options.user
  }
  else if (options.org) {
    options.owner = options.org
    options.ownerType = 'orgs'
  }

  try {
    var repos = jsonfile.readFileSync(options.reposFile)
    handleRepos(options, repos)
  }
  catch (e) {
    var octo = new Octokat(Object.assign({},
      _.pick(options, ['username', 'password', 'token'])
    ))

    var reposOrg = options.owner ? octo[options.ownerType](options.owner) : octo.users
    var repoPromises = reposOrg.repos.fetch()

    fetchAll(repoPromises).then(function (repos) {
      mkdirp.sync(path.dirname(options.reposFile))
      jsonfile.writeFileSync(options.reposFile, repos)
      handleRepos(options, repos)
    }, function (err) {
      console.error(err)
    })
    .catch(function (err) {
      console.error(err)
    })
  }
}

function fetchAll (startPromise) {
  return promiseRecurse(startPromise, function (result) {
    return !result ? null : result.nextPage ? result.nextPage() : null
  }).then(function (results) {
    return _.flatten(results)
  })
}

function handleRepos (options, repos) {

  repos = repos.slice(0, options.maxRepos)

  // Promise.all(repos.map(_.partial(handleRepo, options)))
  var all = new PromiseSeries({ mode: 'array' })
  repos.forEach(function (repo) {
    var repoOptions = Object.assign({}, options, {
      dir: path.join(options.dir, repo.fullName)
    })
    var promise = handleRepoPromise(repoOptions, repo)
    all.add(promise)
  })
  all.run()
  .then(function (results) {
    console.log('RESULTS', results)

    var totalSize = results.reduce(function (memo, repo) {
      return memo + (repo.size || 0)
    }, 0)

    console.log(filesize(totalSize).human())
  }, function (err) {
    console.log('ERROR', err)
  })
  .catch(function (err) {
    console.error(err)
  })

}

function handleRepoPromise (options, repo) {
  return function () {
    return handleRepo(options, repo)
  }
}

function handleRepo (options, repo) {
  return new Promise(function (resolve, reject) {
    // console.log(options, repo)

    var state = {
      repo: repo
    }

    var dir = options.dir || temp.mkdirSync('github-mirror-')
    // console.log(dir)
    var cloneDir = path.join(dir, 'git')
    console.log(repo.cloneUrl)
    assert(repo.cloneUrl)

    if (!options.clone) {
      return resolve(state)
    }

    console.log('cloning', repo.fullName)
    gift.clone(repo.cloneUrl, cloneDir, function (err, _repo) {
      if (err) {
        state.error = err
        state.errorAt = 'CLONE'
        return reject(state)
      }
      // console.log(err, _repo)
      console.log('cloned', repo.fullName)

      state.clone = _repo

      getSize(_repo.path, function (err, size) {
        if (err) {
          // state.error = err
          // state.errorAt = 'getSize'
          // return reject(state)
          return resolve(state)
        }
        // console.log(size)
        console.log(filesize(size).human())
        try {
          temp.cleanupSync()
        }
        catch (e) {
          // console.warn(e)
        }
        state.size = size
        resolve(state)
      })

    })
  })
}
