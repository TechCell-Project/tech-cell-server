/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { spawn } = require('child_process');

const SEARCH_DIR = './dist/apps/';
const SERVICE_NAME = process.argv[2];

// Check if SERVICE_NAME is empty and exit the script with an error message if necessary
if (!SERVICE_NAME) {
    console.error('Error: SERVICE_NAME argument is missing');
    process.exit(1);
}

async function buildApps() {
    const appDirs = await fs.promises.readdir(SEARCH_DIR, { withFileTypes: true });
    let isFound = false;

    for (const dirent of appDirs) {
        if (dirent.isDirectory()) {
            if (dirent.name === SERVICE_NAME) {
                const dirName = dirent.name;
                const pathToMain = `${SEARCH_DIR}${dirName}/main.js`;
                console.log(`Found ${dirName}, running '${dirName}' services in production...`);

                try {
                    isFound = true;
                    const childProcess = spawn('node', [pathToMain]);
                    childProcess.stdout.on('data', (data) => {
                        console.log(data.toString());
                    });
                    childProcess.stderr.on('data', (data) => {
                        console.error(data.toString());
                    });
                } catch (error) {
                    isFound = false;
                    console.error(error.message);
                    console.error(`Can't run production '${SERVICE_NAME}' services`);
                }
            }
        }
    }

    if (!isFound) {
        console.log(`Not found ${SERVICE_NAME} services, exit...`);
        process.exit(1);
    }
}

buildApps();
