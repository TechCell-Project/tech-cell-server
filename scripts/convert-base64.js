/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

// Get file name from command-line arguments, default to .env.prod
const fileName = process.argv[2] || '.env.prod';

// Read file
fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading ${fileName} file:`, err);
        return;
    }

    // Convert to base64
    const base64Data = Buffer.from(data).toString('base64');

    // Print base64 string
    console.log(base64Data);
});
