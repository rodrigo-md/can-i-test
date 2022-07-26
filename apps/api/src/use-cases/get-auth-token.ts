export interface GithubClient {
    getAccessToken(authorizationCode: string): Promise<{accessToken: string}>;
    getUser(token: string): Promise<{username: string, avatarUrl: string, homepage: string}>;
}

export interface JWT {
    sign(data: object, key: string, options? : {algorithm: string }): Promise<string>
}

export interface AuthTokenDTO {
    authorizationCode: string;
    jwtSecret: string
}

export const getAuthTokenUseCase = async (githubClient: GithubClient, jwt: JWT, authTokenDTO: AuthTokenDTO) => {
    const  { authorizationCode, jwtSecret } = authTokenDTO;

    const { accessToken: githubToken } = await githubClient.getAccessToken(authorizationCode);
    const personalInfo = await githubClient.getUser(githubToken);

    const payload = {
        ...personalInfo,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };

    const signedToken = await jwt.sign({...payload, githubToken}, jwtSecret);
    const signature = {
        githubToken,
        signedToken
    };

    return { payload, signature};
};