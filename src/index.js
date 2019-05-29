// https://github.com/philschatz/octokat.js
// https://developer.github.com/v3/

import "@babel/polyfill";
import Octokat from "octokat";
import mkdirp from "mkdirp";
import jsonfile from "jsonfile";
import path from "path";
import gift from "gift";
import assert from "assert";
import _ from "lodash";
import temp from "temp";
import getSize from "get-folder-size";
import filesize from "file-size";
import { promiseRecurse } from "promise-recurse";
import debugFactory from "debug";

const debug = debugFactory("github-mirror");

temp.track();

function run(options) {
  options = options || {};
  options.dir = options.dir || temp.mkdirSync("github-mirror-");
  options.clone = options.clone === false ? false : true;
  options.ownerType = options.ownerType || "users"; // or 'orgs'

  if (options.user) {
    options.owner = options.user;
  } else if (options.org) {
    options.owner = options.org;
    options.ownerType = "orgs";
  }

  if (!options.dryRun) {
    options.dir = options.dir || process.cwd();
  }

  debug("options", options);

  var reposPromise;
  if (options.reposFile && !options.fresh) {
    try {
      reposPromise = Promise.resolve(jsonfile.readFileSync(options.reposFile));
    } catch (e) {
      reposPromise = fetchRepos(options);
    }
  } else {
    reposPromise = fetchRepos(options);
  }

  reposPromise
    .then(function(repos) {
      handleRepos(options, repos);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function fetchRepos(options) {
  return new Promise(function(resolve, reject) {
    assert(options.token || (options.username && options.password));
    var octo = new Octokat(
      Object.assign({}, _.pick(options, ["username", "password", "token"]))
    );

    var reposOrg = options.owner
      ? octo[options.ownerType](options.owner)
      : octo.user;
    var repoPromises = reposOrg.repos.fetch();

    fetchAll(repoPromises)
      .then(
        function(repos) {
          var reposFile =
            options.reposFile || path.join(options.dir, "repos.json");
          mkdirp.sync(path.dirname(reposFile));
          jsonfile.writeFileSync(reposFile, repos, { spaces: 2 });
          resolve(repos);
        },
        function(err) {
          console.error(err);
          reject(err);
        }
      )
      .catch(function(err) {
        console.error(err);
        reject(err);
      });
  });
}

function fetchAll(startPromise) {
  return promiseRecurse(startPromise, result =>
    !result ? null : result.nextPage ? result.nextPage() : null
  ).then(results => _.flatten(results));
}

const handleRepos = async (options, repos) => {
  repos = repos.slice(0, options.maxRepos);

  try {
    const totalSize = repos.reduce((acc, repo) => acc + (repo.size || 0), 0);

    console.log("Total size:", filesize(totalSize).human());

    for (const repo of repos) {
      await handleRepo(
        {
          ...options,
          dir: path.join(options.dir, repo.fullName)
        },
        repo
      );
    }
  } catch (error) {
    console.error(error);
  }
};

function handleRepo(options, repo) {
  return new Promise(function(resolve, reject) {
    // console.log(options, repo)

    var state = {
      repo: repo
    };

    var dir = options.dir || temp.mkdirSync("github-mirror-");
    // console.log(dir)

    var cloneDir = path.join(dir, "git");
    console.log(repo.cloneUrl);
    assert(repo.cloneUrl);

    if (!options.clone) {
      return resolve(state);
    }

    console.log("cloning", repo.fullName, "into", cloneDir);
    gift.clone(repo.cloneUrl, cloneDir, function(err, _repo) {
      if (err) {
        state.error = err;
        state.errorAt = "CLONE";
        return reject(state);
      }
      // console.log(err, _repo)
      console.log("cloned", repo.fullName);

      state.clone = _repo;

      getSize(_repo.path, function(err, size) {
        if (err) {
          // state.error = err
          // state.errorAt = 'getSize'
          // return reject(state)
          return resolve(state);
        }
        // console.log(size)
        console.log(filesize(size).human());
        try {
          temp.cleanupSync();
        } catch (e) {
          // console.warn(e)
        }
        state.size = size;
        resolve(state);
      });
    });
  });
}

export default run;
