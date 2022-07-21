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


export default {
  BadGateway,
  BadRequest
};
