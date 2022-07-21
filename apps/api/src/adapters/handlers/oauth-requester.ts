import type { HttpContext } from './interfaces/http';

interface OauthConfig {
  clientId: string;
}

// TODO: validate oauth config
export const createOauthRequesterHandler = (data: OauthConfig) => {
  return async (ctxt: Pick<HttpContext, 'redirect'>) => {
    const { clientId } = data;

    ctxt.redirect(
      302,
      `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,user:email`,
    );
  };
};
