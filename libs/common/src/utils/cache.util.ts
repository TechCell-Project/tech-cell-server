import { Store } from 'cache-manager';
import { Logger } from '@nestjs/common';

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
