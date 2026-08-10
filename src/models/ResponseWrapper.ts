export interface ResponseWrapper<T> {
    data: T;
    message: string;
    code: number;
}
