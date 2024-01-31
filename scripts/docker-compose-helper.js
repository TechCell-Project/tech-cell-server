/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const { existsSync } = require('fs');

function validateInputs(env, action) {
    if (!env) {
        throw new Error(
            'Environment (postfix of docker compose file) argument is missing. (core/prod/metric/...)',
        );
    }
    const composeFile = `./docker-compose.${env?.toString().toLowerCase()}.yml`;
    if (!existsSync(composeFile)) {
        throw new Error(`File ${composeFile} not found!`);
    }

    if (!action) {
        throw new Error('Action argument is missing (up/down/restart/...)');
    }
}

function getCommand(env, action, services) {
    const composeFile = `./docker-compose.${env?.toString().toLowerCase()}.yml`;
    const serviceNames = services.join(' ');
    const upAction = `docker compose -f ${composeFile} up -d ${serviceNames}`;
    const downAction = `docker compose -f ${composeFile} down ${serviceNames}`;

    switch (action) {
        case 'up':
        case 'run':
            return upAction;
        case 'down':
        case 'stop':
            return downAction;
        case 'restart':
            return `${downAction} && ${upAction}`;
        case 'update':
            return `docker compose -f ${composeFile} pull ${serviceNames} && ${upAction}`;
        default:
            throw new Error(
                `Action ${action} is not supported. Use one of: up/down/restart/update`,
            );
    }
}

function runCommand(command) {
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

function dockerComposeAction(env, action, services = []) {
    validateInputs(env, action);
    const command = getCommand(env, action, services);
    runCommand(command);
}

module.exports = dockerComposeAction;

const [env, action, ...serviceNames] = process.argv.slice(2);
dockerComposeAction(env, action, serviceNames);
