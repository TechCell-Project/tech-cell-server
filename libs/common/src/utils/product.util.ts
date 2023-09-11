import { diff } from 'deep-diff';

interface OmitKey {
    type: 'omit';
    omitKey: string[];
}

interface PickKey {
    type: 'pick';
    pickKey: string[];
}

type OmitOrPickKey = OmitKey | PickKey;

/**
/**
 * Compares two objects and returns the differences between them.
 *
 * @param currentObj The current object to compare (LHS).
 * @param comingObj The incoming object to compare (RHS).
 * @param typeKey An object specifying whether to omit or pick certain keys.
 *                If `type` is `'omit'`, the `omitKey` property should be an array of keys to omit.
 *                If `type` is `'pick'`, the `pickKey` property should be an array of keys to pick.
 * @returns An object containing the differences between the two objects.
 *
 * @description
 * The `kind` property of each change object indicates the kind of change and will be one of the following:
 * - `N`: indicates a newly added property/element
 * - `D`: indicates a property/element was deleted
 * - `E`: indicates a property/element was edited
 * - `A`: indicates a change occurred within an array
 *
 * The `lhs` property of each change object contains the value on the left-hand-side of the comparison (undefined if kind === 'N').
 *
 * The `rhs` property of each change object contains the value on the right-hand-side of the comparison (undefined if kind === 'D').
 *
 * If `typeKey` is of type `OmitKey`, the function will omit the keys specified in the `omitKey` array.
 *
 * If `typeKey` is of type `PickKey`, the function will pick the keys specified in the `pickKey` array.
 * If a key is not in the `pickKey` array, it will be omitted.
 *
 * @example
 * const currentObj = { a: 1, b: 2, c: { d: 3 } };
 * const comingObj = { a: 1, b: 3, c: { d: 4 } };
 * const typeKey = { type: 'omit', omitKey: ['c.d'] };
 * const diff = compareTwoObjectAndGetDifferent(currentObj, comingObj, typeKey);
 * // diff = { 'b': { kind: 'E', lhs: 2, rhs: 3 } }
 */
export function compareTwoObjectAndGetDifferent(
    currentObj: object,
    comingObj: object,
    typeKey: OmitOrPickKey,
) {
    const diffData = diff(currentObj, comingObj);
    if (!diffData) {
        return undefined;
    }

    const result = {};
    for (const change of diffData) {
        const currentPath = change.path.join('.');
        if (!shouldBypassKey(currentPath, typeKey)) {
            result[currentPath] = change;
        }
    }

    return result;
}

function shouldBypassKey(currentPath: string, typeKey: OmitOrPickKey) {
    const bypassKeys = typeKey.type === 'omit' ? typeKey.omitKey : typeKey.pickKey;
    if (!bypassKeys?.length) {
        return false;
    }
    if (typeKey.type === 'pick') {
        return !bypassKeys.includes(currentPath);
    }
    return bypassKeys.some((bypassKey) => {
        if (bypassKey.endsWith('#')) {
            return currentPath.startsWith(bypassKey.slice(0, -1));
        }
        const bypassKeyParts = bypassKey.split('.');
        const currentPathParts = currentPath.split('.');
        if (bypassKeyParts.length !== currentPathParts.length) {
            return false;
        }
        return bypassKeyParts.every(
            (part, index) => part === '#' || part === currentPathParts[index],
        );
    });
}

export function removeFieldsFromObject<T>(obj: T, fields: string[]) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => removeFieldsFromObject(item, fields));
    }
    const result: any = { ...obj };
    for (const field of fields) {
        if (field.endsWith('.#')) {
            const key = field.slice(0, -2);
            if (key in result) {
                result[key] = result[key].map((item) => removeFieldsFromObject(item, fields));
            }
        } else {
            delete result[field];
        }
    }
    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            result[key] = removeFieldsFromObject(result[key], fields);
        }
    }
    return result;
}
