/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs').promises;
const { spawn } = require('child_process');

const SEARCH_DIR = './dist/apps/';
const SERVICE_NAME = process.argv[2];

async function startProduction() {
    let dir;
    try {
        dir = await fs.opendir(`${SEARCH_DIR}${SERVICE_NAME}`);
        console.log(`Found ${SERVICE_NAME}, running '${SERVICE_NAME}' services in production...`);

        const childProcess = spawn('node', [`${SEARCH_DIR}${SERVICE_NAME}/main.js`]);
        childProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });
        childProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(`Can't run production '${SERVICE_NAME}' services`);
        process.exit(1);
    } finally {
        if (dir) {
            dir.close();
        }
    }
}

async function runApp() {
    if (!SERVICE_NAME) {
        console.error('Error: SERVICE_NAME argument is missing');
        process.exit(1);
    }

    try {
        await startProduction();
    } catch (error) {
        console.log(`Not found ${SERVICE_NAME} services, exit...`);
        process.exit(1);
    }
}

runApp();
