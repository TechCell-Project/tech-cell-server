/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const https = require('https');
const fs = require('fs');

const port = 9001;
const folder = './compodoc';
const faviconUrl = 'https://techcell.cloud/favicon.ico';
const logoUrl = 'https://techcell.cloud/_next/image?url=%2Flogo-red.png&w=1920&q=75';

if (process.argv.includes('--serve') || process.argv.includes('-s')) {
    runCompodoc();
} else {
    buildCompodoc();
}

function runCompodoc(build = false) {
    let command = `npx @compodoc/compodoc -p tsconfig.doc.json`;
    if (!build) {
        command += ` --serve`;
    }
    command += ` --port ${port}`;
    command += ` --output ${folder}`;
    command += ` --name "TechCell documentation"`;
    command += ` --customFavicon ${folder}/favicon.ico`;
    command += ` --customLogo ${folder}/logo.png`;
    command += ` --disableCoverage`;
    command += ` --hideGenerator`;

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

function buildCompodoc() {
    let command = `rimraf ${folder}`;

    const rimrafProcess = spawn(command, { shell: true, stdio: 'pipe' });

    rimrafProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`rimraf process exited with code ${code}`);
            return;
        }

        // Create the folder if it doesn't exist
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        // Download the favicon
        https.get(faviconUrl, (res) => {
            const fileStream = fs.createWriteStream(`${folder}/favicon.ico`);
            res.pipe(fileStream);
        });

        // Download the logo
        https.get(logoUrl, (res) => {
            const fileStream = fs.createWriteStream(`${folder}/logo.png`);
            res.pipe(fileStream);
        });

        runCompodoc(true);
    });
}
