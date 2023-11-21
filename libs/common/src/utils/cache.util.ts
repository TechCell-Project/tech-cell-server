import { Store } from 'cache-manager';
import { Logger } from '@nestjs/common';
import { REVOKE_ACCESS_TOKEN, REVOKE_REFRESH_TOKEN } from '~libs/common/constants';

/**
 *  Delete all keys with the prefix
 * @param prefix Prefix of the key
 * @param cacheManager Cache manager store instance
 * @returns Promise of void to delete all keys with the prefix
 */
export async function delStartWith(prefix: string, cacheManager: Store) {
    const keys = await cacheManager.keys();
    if (!keys) {
        Logger.warn(`No keys found with the prefix: ${prefix}`);
        return;
    }
    const keysToDelete = keys.filter((key) => key.startsWith(prefix));
    return await Promise.all(keysToDelete.map((key) => cacheManager.del(key)));
}

/**
 *
 * @param refreshToken the refresh token to build the key to revoke
 * @returns the key to revoke the refresh token
 */
export function buildRevokeRefreshTokenKey(refreshToken: string): string {
    const revokeRefreshTokenKey = `${REVOKE_REFRESH_TOKEN}_${refreshToken}`;
    return revokeRefreshTokenKey;
}

/**
 *
 * @param accessToken the access token to build the key to revoke
 * @returns the key to revoke the access token
 */
export function buildRevokeAccessTokenKey(accessToken: string): string {
    const revokeAccessTokenKey = `${REVOKE_ACCESS_TOKEN}_${accessToken}`;
    return revokeAccessTokenKey;
}
