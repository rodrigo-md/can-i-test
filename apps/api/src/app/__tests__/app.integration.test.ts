import { describe, test } from '@jest/globals';
import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';
import * as request from 'supertest';
import app from '../app';
import type { SuperTest, Test } from 'supertest';

jest.mock('../constants', () => ({
  auth: {
    oauth: { clientId: '', clientSecret: '' },
    jwtSecret: 'jwt-secret',
    aproximateJwtExpirationInSeconds: 5,
  },
}));

const JWT_TESTING_SECRET = 'jwt_secret-test';
// Can't be used inside jest.mock, jest doesnt allow it
const JWT_SECRET = 'jwt-secret';
jest.setTimeout(15000);

describe('Express app', () => {
  describe('authentication flow', () => {
    let httpAgent: SuperTest<Test> | undefined;

    beforeAll(() => {
      httpAgent = request(app);
    });

    test('returns 401 when authentication cookies are not sent', async () => {
      return httpAgent.get('/test-auth').expect(401);
    });

    test('returns 401 when token cookie is missing', async () => {
      const authCookie = createFakeAuthCookie();
      return httpAgent
        .get('/test-auth')
        .set('Cookie', [authCookie])
        .expect(401);
    });

    test('returns 401 when auth cookie is missing', async () => {
      const tokenCookie = createFakeTokenCookie();
      return httpAgent
        .get('/test-auth')
        .set('Cookie', [tokenCookie])
        .expect(401);
    });

    test('returns 403 when both cookies are set but the jwt signature is wrong', async () => {
      const auth = {
        username: 'octocat',
        homepage: 'https://github.com/octocat',
        avatarUrl: 'httops://avatars.githubusercontent.com/21839',
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // not expired token
      };
      const githubToken = 'gho_igvihnofir2389SDFJLK89sd89f';
      const payload = { ...auth, githubToken };

      const jwtAsync = promisify<typeof payload, string, string>(jwt.sign);
      const signedToken = await jwtAsync(payload, JWT_TESTING_SECRET);

      const authCookie = createFakeAuthCookie(auth);
      const tokenCookie = createFakeTokenCookie({ githubToken, signedToken });

      return httpAgent
        .get('/test-auth')
        .set('Cookie', [`${authCookie};${tokenCookie}`])
        .expect(403);
    });

    test('returns 403 when cookies are valid but expired', async () => {
      const dayInSeconds = 24 * 60 * 60;
      const auth = {
        username: 'octocat',
        homepage: 'https://github.com/octocat',
        avatarUrl: 'httops://avatars.githubusercontent.com/21839',
        exp: Math.floor(Date.now() / 1000) - dayInSeconds, // expired 1 day ago
      };
      const githubToken = 'gho_igvihnofir2389SDFJLK89sd89f';
      const payload = { ...auth, githubToken };

      const jwtAsync = promisify<typeof payload, string, string>(jwt.sign);
      const signedToken = await jwtAsync(payload, JWT_SECRET);

      const authCookie = createFakeAuthCookie(auth);
      const tokenCookie = createFakeTokenCookie({ githubToken, signedToken });

      return httpAgent
        .get('/test-auth')
        .set('Cookie', [`${authCookie};${tokenCookie}`])
        .expect(403);
    });

    test('returns 200 when cookies are valid and active', async () => {
      const auth = {
        username: 'octocat',
        homepage: 'https://github.com/octocat',
        avatarUrl: 'httops://avatars.githubusercontent.com/21839',
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // expired in one more hour
      };
      const githubToken = 'gho_igvihnofir2389SDFJLK89sd89f';
      const payload = { ...auth, githubToken };

      const jwtAsync = promisify<typeof payload, string, string>(jwt.sign);
      const signedToken = await jwtAsync(payload, JWT_SECRET);

      const authCookie = createFakeAuthCookie(auth);
      const tokenCookie = createFakeTokenCookie({ githubToken, signedToken });

      return httpAgent
        .get('/test-auth')
        .set('Cookie', [`${authCookie};${tokenCookie}`])
        .expect(200);
    });
  });
});

function createFakeAuthCookie(auth?: {
  username: string;
  homepage: string;
  avatarUrl: string;
  exp: number;
}) {
  const defaultAuth = {
    username: 'octocat',
    homepage: 'https://github.com/octocat',
    avatarUrl: 'httops://avatars.githubusercontent.com/21839',
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  return `auth=${encodeURIComponent(
    `j:${JSON.stringify(auth ?? defaultAuth)}`,
  )}; Path=/; Secure; SameSite=None`;
}

function createFakeTokenCookie({
  githubToken,
  signedToken,
}: { githubToken?: string; signedToken?: string } = {}) {
  const github = githubToken ?? 'gho_as89129ed8a9sd';
  const signed = signedToken ?? '123qwda.123q23asd.123q23';
  const tokenCookie = { githubToken: github, signedToken: signed };

  return `token=${encodeURIComponent(
    `j:${JSON.stringify(tokenCookie)}`,
  )}; Path=/; HttpOnly; Secure; SameSite=None`;
}
