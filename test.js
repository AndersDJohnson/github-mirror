import mirror from "./src";

mirror({
  reposFile: "./data/repos.json",
  dir: "./data/mirror",
  maxRepos: 2,
  // clone: false,
  token: process.env.GITHUB_TOKEN
});
