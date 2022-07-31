import { Result, Ok, Err } from '../use-cases/interfaces';

export const err = <S, F>(v: F): Result<S, F> => {
  return new Err<S, F>(v);
};

export const ok = <S, F>(v: S): Result<S, F> => {
  return new Ok(v);
};
