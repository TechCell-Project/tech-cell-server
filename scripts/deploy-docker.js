/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { spawn } = require('child_process');
const program = require('commander');

program
    .version('1.0.0')
    .description('Deploy Docker images')
    .arguments('<environment>')
    .option('-b, --build', 'Build Docker images')
    .option('-u, --up', 'Deploy Docker images')
    .option('-d, --down', 'Remove Docker images')
    .option('-ro, --remove-orphans', 'Remove orphaned Docker containers')
    .option('-rv, --remove-volumes', 'Remove Docker volumes')
    .option('-ri, --remove-image', 'Remove Docker images and its cache')
    .option('-a, --all', 'Build and deploy Docker images')
    .option('-e, --set-env', 'Set environment variables')
    .option('-ra, --remove-all', 'Remove all Docker images and volumes')
    .action((environment) => {
        console.log(`Deploying to ${environment} environment...`);
        if (!environment) {
            console.error('Error: environment argument is missing');
            process.exit(1);
        }

        const composeFile = `./docker-compose.${environment.toString().toLowerCase()}.yml`;
        const args = ['-f', composeFile];
        if (!fs.existsSync(composeFile)) {
            console.error(`File ${composeFile} not found!`);
            process.exit(1);
        }

        if (program.build) {
            args.push('build');
        }
        if (program.up) {
            args.push('up', '-d');
        }
        if (program.down) {
            args.push('down');
        }
        if (program.removeImage) {
            args.push('down', '--rmi', 'all');
        }
        if (program.removeOrphans) {
            args.push('down', '--remove-orphans');
        }
        if (program.removeVolumes) {
            args.push('down', '--volumes');
        }
        if (program.all) {
            args.push('build', 'up', '-d');
        }
        if (program.removeAll) {
            args.push('down', '--rmi', 'all', '--volumes');
        }

        console.log(`Exec on file: '${composeFile}'`);

        const deployProcess = spawn('docker compose', args, {
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
