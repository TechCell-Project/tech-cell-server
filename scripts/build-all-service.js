/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

async function buildApps() {
    const appsDir = './apps';
    const appDirs = await fs.promises.readdir(appsDir, { withFileTypes: true });

    for (const dirent of appDirs) {
        if (dirent.isDirectory()) {
            const dirName = dirent.name;
            console.log(`Found ${dirName}, building '${dirName}' services...`);

            try {
                const { stdout, stderr } = await exec(`yarn build ${dirName}`);
                console.log(stdout);
                console.error(stderr);
            } catch (error) {
                console.error(error);
            }
        }
    }
}

buildApps();
