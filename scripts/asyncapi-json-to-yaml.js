/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

const port = process.env.COMMUNICATIONS_PORT || 8001;
axios
    .get(`http://localhost:${port}/-json`)
    .then((response) => {
        const yamlStr = yaml.dump(response.data);
        fs.writeFileSync('asyncapi.yaml', yamlStr, 'utf8');
        console.log('Asyncapi YAML file has been saved!');
    })
    .catch((error) => {
        console.error(error);
        throw error;
    });
