import { BadRequestException, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { catchError, throwError } from 'rxjs';
import { emailRegex } from '@app/common/constants/regex.constant';
import * as sanitizeHtml from 'sanitize-html';
import { QueryOptions, Types } from 'mongoose';
import { ObjectIdLike } from 'bson';

const logger = new Logger('SharedUtil');

export function isEmail(email: string): boolean {
    if (typeof email !== 'string') return false;
    return emailRegex.test(email);
}

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
        result += `${characters[(Math.random() * charactersLength) | 0]}`;
    }
    return result;
}

export function capitalize(str: string) {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
}

export function dateFormat(date: Date, format: string): string {
    const pad = (n: number) => (n < 10 ? `0${n}` : n).toString();
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return format
        .replace('yyyy', year.toString())
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second);
}

/**
 *
 * @param str String to replace space
 * @param replaceTo The string to replace space
 * @returns the string after replace space
 * @default replaceTo is '_'
 */
export function replaceWhitespaceTo(str: string, replaceTo = '_') {
    return str.replace(/\s+/g, replaceTo);
}

/**
 * @param data The data to validate
 * @param dto The DTO to validate
 */
export async function validateDTO(data: any, dto: any) {
    let isUnexpected = true;
    try {
        const errors = await validate(plainToInstance(dto, data));
        if (errors.length > 0) {
            const constraints = errors.reduce((acc, error) => {
                Object.values(error.constraints).forEach((constraint) => {
                    acc.push(constraint);
                });
                return acc;
            }, []);
            isUnexpected = false;
            throw new RpcException(new BadRequestException(constraints));
        }
    } catch (error) {
        if (!isUnexpected) {
            logger.error(`[validateDTO] ${error}]`);
        }
        throw new RpcException(new BadRequestException(error.message));
    }
}

/**
 *
 * @param envVariable The environment variable to check
 * @returns true if the environment variable is enable, otherwise false
 * @description enable value: true, 1, 'on', 'enable'
 */
export function isEnable(envVariable: string | number | boolean = undefined) {
    switch (String(envVariable)?.toLowerCase()?.trim()) {
        case 'true':
        case '1':
        case 'on':
        case 'enable':
            return true;
        default:
            return false;
    }
}

/**
 *
 * @param stringValue The string value to check if it is true
 * @returns true if the string value is true, otherwise false
 * @description true value: true
 */
export function isTrueSet(stringValue: string | boolean) {
    return !!stringValue && String(stringValue)?.toLowerCase()?.trim() === 'true';
}

/**
 * Find duplicates in an array.
 * @param arr - The array to search for duplicates.
 * @returns A `Set` containing the duplicate items in the array.
 */
export function findDuplicates<T>(arr: T[]): Set<T> {
    const seen = new Set<T>();
    const duplicates = new Set<T>();

    for (const item of arr) {
        if (seen.has(item)) {
            duplicates.add(item);
        } else {
            seen.add(item);
        }
    }

    return duplicates;
}

/**
 *
 * @param html Sanitize html string
 * @returns A string after sanitize
 */
export function sanitizeHtmlString(html = ''): string {
    const result = sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: { img: ['src', 'alt', 'width', 'height'] },
        allowedSchemes: ['data', 'http', 'https'],
    });
    return result;
}

/**
 * @param id Can be a 24 character hex string, 12 byte binary Buffer, or a number.
 * @returns The ObjectId
 */
export function convertToObjectId(
    id: string | number | Types.ObjectId | ObjectIdLike | Uint8Array,
) {
    try {
        return new Types.ObjectId(id);
    } catch (error) {
        logger.error(error);
        throw new Error('Invalid ObjectId');
    }
}

/**
 *
 * @param ms The time to sleep in milliseconds
 * @description This function is used to sleep in async function
 * @returns A promise that resolves after the specified time
 */
export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * @param page page query
 * @param pageSize pageSize query
 * @returns
 */
export function convertPageQueryToMongoose({
    page = 0,
    pageSize = 0,
}: {
    page?: number;
    pageSize?: number;
}): Pick<QueryOptions, 'skip' | 'limit'> {
    const limit = Math.max(0, pageSize);
    const skip = Math.max(0, page - 1) * Math.max(0, pageSize);
    return {
        skip,
        limit,
    };
}
