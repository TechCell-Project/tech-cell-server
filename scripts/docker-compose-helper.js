/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const { existsSync } = require('fs');

function dockerComposeAction(env, action, services = []) {
    if (!env || env === undefined || env === null || env === '') {
        throw new Error(
            'Environment (postfix of docker compose file) argument is missing. (core/prod/metric/...)',
        );
    }

    if (!action || action === '' || action === undefined || action === null) {
        throw new Error('Action argument is missing (up/down/restart/...)');
    }
    const composeFile = `./docker-compose.${env?.toString().toLowerCase()}.yml`;
    if (!existsSync(composeFile)) {
        console.error(`File ${composeFile} not found!`);
        process.exit(1);
    }

    let command = '';
    const serviceNames = services.join(' ');
    const upAction = `docker compose -f ${composeFile} up -d ${serviceNames}`;
    const downAction = `docker compose -f ${composeFile} down ${serviceNames}`;
    switch (action) {
        case 'up':
        case 'run':
            command = upAction;
            break;
        case 'down':
        case 'stop':
            command = downAction;
            break;
        case 'restart':
            command = `${downAction} && ${upAction}`;
            break;
        case 'update':
            command = `docker compose -f ${composeFile} pull ${serviceNames} && ${upAction}`;
            break;
        default:
            throw new Error(
                `Action ${action} is not supported. Use one of: up/down/restart/update`,
            );
    }
    console.log(`Running command: ${command}`);
    const deployProcess = spawn(command, {
        stdio: 'inherit',
        shell: true,
    });

    deployProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`Deploy process exited with code ${code}`);
            return;
        }
        console.log('Deployed successfully!');
    });
}
module.exports = dockerComposeAction;

const [env, action, ...serviceNames] = process.argv.slice(2);
dockerComposeAction(env, action, serviceNames);
