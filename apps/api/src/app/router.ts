import { auth } from './constants';
import axios from 'axios';
import expressAdapter from '../adapters/express-http';
import { createOauthRequesterHandler } from '../adapters/handlers/oauth-requester';
import type { Router } from 'express';
import { createGetAuthTokenHandler } from '../adapters/handlers/get-auth-token';
import { createAuthenticationHandler } from '../adapters/handlers/authentication';
import createGithubClient from '../adapters/clients/github';
import jwt from '../adapters/services/jwt';
import validatorFactory from '../adapters/services/validator';

const githubClient = createGithubClient(axios, {
  clientId: auth.oauth.clientId,
  clientSecret: auth.oauth.clientSecret,
});

const oauthRequestHandler = createOauthRequesterHandler({
  clientId: auth.oauth.clientId,
});

const getAuthTokenHandler = createGetAuthTokenHandler(githubClient, jwt, {
  jwtSecret: auth.jwtSecret,
});

const authHandler = createAuthenticationHandler(validatorFactory, jwt, {
  jwtSecret: auth.jwtSecret,
  aproximateJwtExpirationInSeconds: auth.aproximateJwtExpirationInSeconds,
});

export default (router: Router) => {
  router.get('/oauth/login', expressAdapter(oauthRequestHandler));
  router.get('/oauth/callback', expressAdapter(getAuthTokenHandler));

  // * jest automatically set NODE_ENV=test
  if (process.env.NODE_ENV === 'test') {
    router.get(
      '/test-auth',
      expressAdapter(authHandler),
      expressAdapter(async function (ctxt) {
        ctxt.status(200);
        ctxt.send({ message: 'ok' });
      }),
    );
  }
};
