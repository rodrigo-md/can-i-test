interface Statistics {
  forks: number;
  stars: number;
  openIssues: number;
}

interface License {
  key: string;
  name: string;
  url: string;
  spdxId: string;
  htmlUrl: string;
}

interface Owner {
  username: string;
  avatarUrl: string;
  homepage: string;
}

interface RepoFile {
  htmlUrl: string;
  url: string;
}

interface RepoFiles {
  codeOfConduct: RepoFile;
  contributing: RepoFile;
  license: License;
  readme: RepoFile;
}

export interface Repository {
  name: string;
  owner: Owner;
  homepage: string;
  languages: string[];
  topics: string[];
  description: string;
  stats: Statistics;
  files: RepoFiles;
}
