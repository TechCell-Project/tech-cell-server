/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const os = require('os');

async function buildApps() {
    const appsDir = './apps';
    const appDirs = await fs.readdir(appsDir, { withFileTypes: true });

    const concurrencyLimit = process.argv[2] ?? (Math.ceil(os.cpus()?.length / 4) || 1); // Set concurrency limit to the number of CPU cores
    const buildPromises = [];

    for (const dirent of appDirs) {
        if (!dirent.isDirectory()) continue;

        const dirName = dirent.name;
        console.log(`Found ${dirName}, building '${dirName}' services...`);

        const buildPromise = exec(`yarn build ${dirName}`).finally(() => {
            // Remove the promise from the array when it's done
            const index = buildPromises.indexOf(buildPromise);
            if (index > -1) {
                buildPromises.splice(index, 1);
            }
        });

        buildPromises.push(buildPromise);

        // Wait for a promise to finish before starting a new one if we're at the concurrency limit
        if (buildPromises.length >= concurrencyLimit) {
            await Promise.race(buildPromises);
        }
    }

    // Wait for all remaining promises to finish
    await Promise.all(buildPromises);
}

buildApps();
