import * as diacritic from 'diacritic';

/**
 * Generates a regular expression that matches a keyword with or without diacritical marks and with different variations of the same letter.
 * @param keyword The keyword to search for.
 * @returns A regular expression that matches the keyword with or without diacritical marks and with different variations of the same letter.
 */
export function generateSearchQuery(keyword: string, caseSensitive = false) {
    // Remove diacritical marks from the keyword.
    // Lowercase the keyword.
    const normalizedKeyword: string = diacritic.clean(keyword)?.toLowerCase();

    // Define the variations for each letter.
    const variations = new Map<string, Set<string>>([
        ['a', new Set('aáàảãạăắằẳẵặâấầẩẫậ')],
        ['e', new Set('eéèẻẽẹêếềểễệ')],
        ['i', new Set('iíìỉĩị')],
        ['o', new Set('oóòỏõọôốồổỗộơớờởỡợ')],
        ['u', new Set('uúùủũụưứừửữự')],
        ['y', new Set('yýỳỷỹỵ')],
        ['d', new Set('dđ')],
    ]);

    // Generate a regular expression that matches the keyword with or without diacritical marks and with different variations of the same letter.
    const regexString = Array.from(normalizedKeyword, (char: string) => {
        const variationsSet = variations.get(char) || new Set(char);
        return `[${Array.from(variationsSet).join('')}]`;
    }).join('');

    return new RegExp(regexString, caseSensitive ? '' : 'i');
}
