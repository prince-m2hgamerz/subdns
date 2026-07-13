export class SubdnsError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "SubdnsError";
    this.status = status;
    this.body = body;
  }
}

export class AuthenticationError extends SubdnsError {
  constructor(message = "Invalid or missing API key") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends SubdnsError {
  public readonly resetAt: number | null;

  constructor(message = "Rate limit exceeded", resetAt?: number) {
    super(message, 429);
    this.name = "RateLimitError";
    this.resetAt = resetAt ?? null;
  }
}

export class NotFoundError extends SubdnsError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends SubdnsError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}
