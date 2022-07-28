import Ajv from 'ajv';

interface ValidationError {
  key: string;
  errorMsg: string;
  // eslint-disable-next-line
  data: any;
}

interface ValidateFunction<T> {
  (value: unknown):
  | { valid: T; errors: null }
  | { valid: null; errors: ValidationError[] };
}

export interface ValidatorFactory {
  <T>(schema: unknown): ValidateFunction<T>;
}

const ajv = new Ajv();

export default <T>(schema: unknown): ValidateFunction<T> => {
  const ajvValidate = ajv.compile<T>(schema);
  return (value: unknown) => {
    const valid = ajvValidate(value);

    if (!valid) {
      return {
        valid: null,
        errors: ajvValidate.errors.map((error) => ({
          key: error.keyword,
          errorMsg: error.message,
          data: error.data,
        })),
      };
    }

    return {
      valid: value,
      errors: null,
    };
  };
};
