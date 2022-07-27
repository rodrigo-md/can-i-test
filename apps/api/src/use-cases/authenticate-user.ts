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

// TODO: pass secret
export const authenticateUserUseCase = async (
  jwt: JWT,
  auth: AuthCookie,
  token: TokenCookie,
) => {
  const { githubToken, signedToken } = token;
  const payload = { ...auth, githubToken };

  const calculatedJwt = await jwt.sign(payload, 'secret');

  // TODO: refactor to add specific Error
  if (signedToken !== calculatedJwt) {
    throw new Error();
  }
};
