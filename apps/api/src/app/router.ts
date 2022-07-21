import { auth } from './constants';
import axios from 'axios';
import expressAdapter from '../adapters/express-http';
import { createOauthRequesterHandler } from '../adapters/handlers/oauth-requester';
import type { Router } from 'express';
import { createGetAuthTokenHandler } from '../adapters/handlers/get-auth-token';
import createGithubClient from '../adapters/clients/github';
import jwt from '../adapters/jwt';


const githubClient = createGithubClient(axios, {
  clientId: auth.oauth.clientId,
  clientSecret: auth.oauth.clientSecret,
});

const oauthRequestHandler = createOauthRequesterHandler({
  clientId: auth.oauth.clientId,
});

const getAuthTokenHandler = createGetAuthTokenHandler(githubClient, jwt, { jwtSecret: auth.jwtSecret});

export default (router: Router) => {
  router.get('/oauth/login', expressAdapter(oauthRequestHandler));
  router.get('/oauth/callback', expressAdapter(getAuthTokenHandler));
};
