export declare class ApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export declare function get<T>(path: string, timeoutMs?: number): Promise<T>;
export declare function post<T>(path: string, body: Record<string, unknown>): Promise<T>;
export declare function del<T>(path: string): Promise<T>;
