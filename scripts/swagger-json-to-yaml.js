/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');

const port = process.env.API_PORT || 8000;
axios
    .get(`http://localhost:${port}/-json`)
    .then((response) => {
        const yamlStr = yaml.dump(response.data);
        fs.writeFileSync('swagger.yaml', yamlStr, 'utf8');
        console.log('Swagger YAML file has been saved!');
    })
    .catch((error) => {
        console.error(error);
        throw error;
    });
