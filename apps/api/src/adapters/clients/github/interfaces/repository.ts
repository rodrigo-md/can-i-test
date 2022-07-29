interface RepoOwner {
  // username
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GithubRepository {
  id: number;
  name: string;

  // <username>/<repository name>
  full_name: string;

  owner: RepoOwner;

  // https://github.com/<username>/<repository name>
  html_url: string;

  // https://api.github.com/repos/<owner>/<repository name>
  url: string;
}
