export class IncorrectClientCredentials extends Error {
  constructor() {
    super('The client_id and/or client_secret passed are incorrect');
    Object.setPrototypeOf(this, IncorrectClientCredentials.prototype);
  }
}

export class BadVerificationCode extends Error {
  constructor() {
    super('The code passed is incorrect or expired');
    Object.setPrototypeOf(this, BadVerificationCode.prototype);
  }
}

export class RequiresAuthentication extends Error {
  constructor() {
    super('Requires authentication');
    Object.setPrototypeOf(this, RequiresAuthentication.prototype);
  }
}

export class Forbidden extends Error {
  constructor() {
    super('Forbidden');
    Object.setPrototypeOf(this, Forbidden.prototype);
  }
}

export class AccessTokenNotFound extends Error {
  constructor() {
    super('Access token not found');
    Object.setPrototypeOf(this, AccessTokenNotFound.prototype);
  }
}


export const isGithubError = (err: Error): boolean => {
  switch (true) {
    case err instanceof Forbidden:
    case err instanceof BadVerificationCode:
    case err instanceof RequiresAuthentication:
    case err instanceof AccessTokenNotFound:
    case err instanceof IncorrectClientCredentials: {
      return true;
    }
  }

  return false;
}

export default {
  IncorrectClientCredentials,
  BadVerificationCode,
  RequiresAuthentication,
  Forbidden,
};
