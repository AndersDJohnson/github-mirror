// https://github.com/philschatz/octokat.js
// https://developer.github.com/v3/

import "@babel/polyfill";
import { promisify } from "util";
import path from "path";
import mkdirp from "mkdirp";
import jsonfile from "jsonfile";
import gift from "gift";
import assert from "assert";
import temp from "temp";
import getSize from "get-folder-size";
import filesize from "file-size";
import debugFactory from "debug";
import fetch from "node-fetch";
import fetchPaginate from "fetch-paginate";

global.fetch = fetch;

const debug = debugFactory("github-mirror");

temp.track();

const run = async (options = {}) => {
  options.dir = options.dir || temp.mkdirSync("github-mirror-");
  options.clone = options.clone === false ? false : true;
  options.ownerType = options.ownerType || "users"; // or 'orgs'

  if (options.user) {
    options.owner = options.user;
    options.ownerType = "users";
  } else if (options.org) {
    options.owner = options.org;
    options.ownerType = "orgs";
  }

  if (!options.dryRun) {
    options.dir = options.dir || process.cwd();
  }

  debug("options", options);

  try {
    let repos;
    if (options.reposFile && !options.fresh) {
      try {
        repos = await Promise.resolve(jsonfile.readFileSync(options.reposFile));
      } catch (e) {
        repos = await fetchRepos(options);
      }
    } else {
      repos = await fetchRepos(options);
    }

    handleRepos(options, repos);
  } catch (err) {
    console.error(err);
  }
};

const fetchRepos = async options => {
  const { org, token, user, dir } = options;

  assert(token);

  let ownerPath;
  if (user) ownerPath = `/users/${user}`;
  else if (org) ownerPath = `/orgs/${org}`;
  else ownerPath = "/user";

  const url = `https://api.github.com${ownerPath}/repos`;

  try {
    const { data: repos } = await fetchPaginate(url, {
      options: {
        headers: {
          Authorization: `token ${token}`
        }
      }
    });
    const reposFile = options.reposFile || path.join(dir, "repos.json");
    mkdirp.sync(path.dirname(reposFile));
    jsonfile.writeFileSync(reposFile, repos, { spaces: 2 });
    return repos;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const handleRepos = async (options, repos) => {
  repos = repos.slice(0, options.maxRepos);

  try {
    const totalSize = repos.reduce((acc, repo) => acc + (repo.size || 0), 0);

    console.log("Total size:", filesize(totalSize).human());

    for (const repo of repos) {
      await handleRepo(
        {
          ...options,
          dir: path.join(options.dir, repo.full_name)
        },
        repo
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const handleRepo = async (options, repo) => {
  var state = {
    repo: repo
  };

  var dir = options.dir || temp.mkdirSync("github-mirror-");

  var cloneDir = path.join(dir, "git");

  console.log(repo.clone_url);

  assert(repo.clone_url);

  if (!options.clone) {
    return state;
  }

  console.log("cloning", repo.full_name, "into", cloneDir);

  try {
    state.errorAt = "CLONE";
    const _repo = await promisify(gift.clone)(repo.clone_url, cloneDir);

    console.log("cloned", repo.full_name);

    state.clone = _repo;

    state.errorAt = "SIZE";
    const size = await promisify(getSize)(_repo.path);

    state.size = size;

    console.log(filesize(size).human());

    state.errorAt = "TEMPCLEANUP";
    temp.cleanupSync();

    return state;
  } catch (err) {
    state.error = err;

    throw state;
  }
};

export default run;
