export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class BadGateway extends HttpError {
  constructor(message?: string) {
    super(502, message ?? 'Bad Gateway');

    Object.setPrototypeOf(this, BadGateway.prototype);
  }
}

export class BadRequest extends HttpError {
  constructor(message?: string) {
    super(400, message ?? 'Bad Request');

    Object.setPrototypeOf(this, BadRequest.prototype);
  }
}

export class Unauthorized extends HttpError {
  constructor(message?: string) {
    super(401, message ?? 'Unauthorized');

    Object.setPrototypeOf(this, Unauthorized.prototype);
  }
}

export class Forbidden extends HttpError {
  constructor(message?: string) {
    super(403, message ?? 'Forbidden');

    Object.setPrototypeOf(this, Forbidden.prototype);
  }
}

export class NotFound extends HttpError {
  constructor(message?: string) {
    super(404, message ?? 'Not Found');

    Object.setPrototypeOf(this, NotFound.prototype);
  }
}

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(500, message ?? 'Internal Server Error');

    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export default {
  BadGateway,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  InternalServerError,
};
