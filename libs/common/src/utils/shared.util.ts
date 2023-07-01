import { RpcException } from '@nestjs/microservices';
import { catchError, throwError } from 'rxjs';

/**
 * @returns A function to catch exception from microservice and throw it to client
 */
export const catchException = () =>
    catchError((error) => throwError(() => new RpcException(error.response)));

// create a function to generate random string
export function generateRandomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters[(Math.random() * charactersLength) | 0];
    }
    return result;
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
