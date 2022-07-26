const oauth = {
  clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
  clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
};

export const auth = {
  oauth,
  jwtSecret: process.env.JWT_SECRET,
};
