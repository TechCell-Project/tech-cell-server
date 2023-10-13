/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { spawn } = require('child_process');
const program = require('commander');

program
    .version('1.0.0')
    .description('Deploy Docker images')
    .arguments('<environment> [services...]')
    .option('-b, --build', 'Build Docker images')
    .option('-u, --up', 'Deploy Docker images')
    .option('-d, --down', 'Remove Docker images')
    .option('-s, --push', 'Push Docker images')
    .option('-p, --pull', 'Pull Docker images')
    .option('-ro, --remove-orphans', 'Remove orphaned Docker containers')
    .option('-rv, --remove-volumes', 'Remove Docker volumes')
    .option('-ri, --remove-image', 'Remove Docker images and its cache')
    .option('-a, --all', 'Build and deploy Docker images')
    .option('-e, --set-env', 'Set environment variables')
    .option('-ra, --remove-all', 'Remove all Docker images and volumes')
    .action((environment, ...services) => {
        console.log(`Deploying to ${environment} environment...`);
        if (!environment) {
            console.error('Error: environment argument is missing');
            process.exit(1);
        }

        const composeFile = `./docker-compose.${environment.toString().toLowerCase()}.yml`;
        let composeArgs = ['-f', composeFile];

        if (!fs.existsSync(composeFile)) {
            console.error(`File ${composeFile} not found!`);
            process.exit(1);
        }

        if (program.build) {
            composeArgs.push('build');
        }
        if (program.up) {
            composeArgs.push('up', '-d');
        }
        if (program.down) {
            composeArgs.push('down');
        }
        if (program.push) {
            composeArgs.push('push');
        }
        if (program.pull) {
            composeArgs.push('pull');
        }
        if (program.removeImage) {
            composeArgs.push('down', '--rmi', 'all');
        }
        if (program.removeOrphans) {
            composeArgs.push('down', '--remove-orphans');
        }
        if (program.removeVolumes) {
            composeArgs.push('down', '--volumes');
        }
        if (program.all) {
            composeArgs.push('build', 'up', '-d');
        }
        if (program.removeAll) {
            composeArgs.push('down', '--rmi', 'all', '--volumes');
        }

        composeArgs = [
            ...composeArgs,
            ...services[0].filter((service) => typeof service === 'string'),
        ];

        console.log(`Executing command: docker compose ${composeArgs.join(' ')}`);

        const deployProcess = spawn('docker', ['compose', ...composeArgs], {
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
    })
    .parse(process.argv);
