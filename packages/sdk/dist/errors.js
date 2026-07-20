export class SubdnsError extends Error {
    constructor(message, status, body) {
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
    constructor(message = "Rate limit exceeded", resetAt) {
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
    constructor(message) {
        super(message, 400);
        this.name = "ValidationError";
    }
}
//# sourceMappingURL=errors.js.map