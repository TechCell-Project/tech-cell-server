import { Cache } from 'cache-manager';

/**
 *  Delete all keys with the prefix
 * @param prefix Prefix of the key
 * @param cacheManager Cache manager instance
 * @returns Promise of void to delete all keys with the prefix
 */
export async function delStartWith(prefix: string, cacheManager: Cache) {
    const store = cacheManager.store;
    if (!store) {
        return;
    }

    const keys = await store?.keys();

    if (!keys) {
        return;
    }
    const keysToDelete = keys.filter((key) => key.startsWith(prefix));
    return await Promise.all(keysToDelete.map((key) => cacheManager.del(key)));
}
