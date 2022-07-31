export enum RepositoryErrors {
  NotFound = 'NotFound',
}

export interface ErrReason<R extends string> {
  type: R;
  reason?: Error;
}

export type Result<S, F> = Ok<S, F> | Err<S, F>;

export class Ok<S, F> {
  readonly value: S;

  constructor(value: S) {
    this.value = value;
  }

  isOk(): this is Ok<S, F> {
    return true;
  }

  isErr(): this is Err<S, F> {
    return false;
  }
}

export class Err<S, F> {
  readonly value: F;

  constructor(value: F) {
    this.value = value;
  }

  isOk(): this is Ok<S, F> {
    return false;
  }

  isErr(): this is Err<S, F> {
    return true;
  }
}
