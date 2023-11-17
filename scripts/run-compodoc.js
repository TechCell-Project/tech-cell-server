/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');

const port = 9001;
const folder = './compodoc';
const faviconDir = `./assets/icons/favicon.ico`;
const logoDir = `./assets/logos/logo-red.png`;

function run() {
    if (process.argv.includes('--build') || process.argv.includes('-b')) {
        return runCompodoc(true);
    }
    if (process.argv.includes('--serve') || process.argv.includes('-s')) {
        return runCompodoc(false);
    }
    return runCompodoc();
}

function runCompodoc(build = false) {
    let command = `npx @compodoc/compodoc`;
    command += ` --output ${folder}`;
    command += ` --port ${port}`;
    command += ` --name "TechCell documentation"`;
    command += ` --customFavicon ${faviconDir}`;
    command += ` --customLogo ${logoDir}`;

    if (!build) {
        command += ` -s`;
    } else {
        command += ` -p tsconfig.doc.json`;
        command += ` --disableCoverage`;
        command += ` --hideGenerator`;
    }

    const compodocProcess = spawn(command, {
        shell: true,
        stdio: 'pipe',
        FORCE_COLOR: true,
    });
    compodocProcess.stdout.pipe(process.stdout);
    compodocProcess.stderr.pipe(process.stderr);

    compodocProcess.on('error', (error) => {
        console.error(`error: ${error}`);
    });

    compodocProcess.on('close', (code) => {
        console.log(`compodoc process exited with code ${code}`);
    });
}

run();
