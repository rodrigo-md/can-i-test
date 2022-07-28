import { JwtTokenExpired, CorruptedCookies } from './errors';

export interface JWT {
  sign(
    data: object,
    key: string,
    options?: { algorithm: string }
  ): Promise<string>;
}

export interface AuthCookie {
  username: string;
  homepage: string;
  avatarUrl: string;
  exp: number;
}

export interface TokenCookie {
  githubToken: string;
  signedToken: string;
}

export interface AuthConfig {
  jwtSecret: string;
  aproximateJwtExpirationInSeconds: number;
}

export const authenticateUserUseCase = async (
  jwt: JWT,
  auth: AuthCookie,
  token: TokenCookie,
  config: AuthConfig,
) => {
  const { githubToken, signedToken } = token;
  const payload = { ...auth, githubToken };

  if (
    auth.exp <=
    Math.floor(Date.now() / 1000) + config.aproximateJwtExpirationInSeconds
  ) {
    throw new JwtTokenExpired();
  }

  const calculatedJwt = await jwt.sign(payload, config.jwtSecret);

  if (signedToken !== calculatedJwt) {
    throw new CorruptedCookies();
  }
};
