import { describe, test } from '@jest/globals';
import { createOauthRequesterHandler } from '../oauth-requester';

describe('OauthRequester handler', () => {
  test('redirect to the indentity provider to request oauth authorization code', async () => {
    const clientId = '189239Q8DU9AS8DU9128EASD';
    const authorizationUrl = 'https://github.com/login/oauth/authorize';
    const handler = createOauthRequesterHandler({
      clientId,
    });
    const ctxt = {
      redirect: jest.fn(),
    };

    await handler(ctxt);

    expect(ctxt.redirect).toHaveBeenCalledWith(
      302,
      `${authorizationUrl}?client_id=${clientId}&scope=read:user,user:email`,
    );
  });
});
