export declare class SubdnsError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(message: string, status: number, body?: unknown);
}
export declare class AuthenticationError extends SubdnsError {
    constructor(message?: string);
}
export declare class RateLimitError extends SubdnsError {
    readonly resetAt: number | null;
    constructor(message?: string, resetAt?: number);
}
export declare class NotFoundError extends SubdnsError {
    constructor(resource?: string);
}
export declare class ValidationError extends SubdnsError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map