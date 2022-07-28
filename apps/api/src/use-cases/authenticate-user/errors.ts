export class JwtTokenExpired extends Error {
  constructor() {
    super('JWT inside cookie has expired');

    Object.setPrototypeOf(this, JwtTokenExpired.prototype);
  }
}

export class CorruptedCookies extends Error {
  constructor() {
    super(
      "Auth cookies have been corrupted since the jwt signature doesn't match",
    );

    Object.setPrototypeOf(this, CorruptedCookies.prototype);
  }
}
