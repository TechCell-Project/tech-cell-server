/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function buildApps() {
    const appsDir = './apps';
    const appDirs = await fs.readdir(appsDir, { withFileTypes: true });

    const concurrencyLimit = 4;
    let runningCount = 0;

    const buildPromises = appDirs
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => {
            const dirName = dirent.name;
            console.log(`Found ${dirName}, building '${dirName}' services...`);

            const buildPromise = exec(`yarn build ${dirName}`);
            buildPromise.finally(() => {
                runningCount--;
            });

            runningCount++;
            return buildPromise;
        });

    for (const buildPromise of buildPromises) {
        if (runningCount >= concurrencyLimit) {
            await Promise.race(buildPromises);
        }

        await buildPromise;
    }
}

buildApps();
