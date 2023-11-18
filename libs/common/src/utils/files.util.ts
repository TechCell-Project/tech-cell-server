import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensures that a log file exists at the specified location, and returns the path to the file.
 *
 * @param {string} logDir - The directory where the log file should be located.
 * @param {string} logFileName - The name of the log file.
 * @returns {string} - The path to the log file.
 */
export function resolveLogFile(logDir: string, logFileName: string): string {
    // Create the log directory if it doesn't exist
    fs.mkdirSync(logDir, { recursive: true });

    // Create the log file if it doesn't exist
    const logFilePath = path.join(logDir, logFileName);
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, '');
    }

    return logFilePath;
}
