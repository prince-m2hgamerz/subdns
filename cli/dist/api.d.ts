export declare function get<T>(path: string): Promise<T>;
export declare function post<T>(path: string, body: Record<string, unknown>): Promise<T>;
export declare function del<T>(path: string): Promise<T>;
