#!/usr/bin/env node
'use strict';

const uploader = require('./uploader');
const argv = require('yargs')
    .usage('$0 <assetsFolder> [args]')
    .demand(1)
    .env('CDN_UPLOADER')
    .option('app-prefix', {
        alias: 'a',
        describe: 'Application prefix used in the CDN url',
        demand: true,
    })
    .option('key-filename', {
        alias: 'k',
        describe: 'JSON key file used to authenticate with GCE. If not set, the credentials option is used.',
    })
    .option('credentials', {
        alias: 'c',
        describe: `Stringified version of the JSON key file used to authenticate with GCE. 
        Can also be set as CDN_UPLOADER_CREDENTIALS environment variable`,
    })
    .option('bucket-name', {
        alias: 'b',
        default: 'fiaas-assets',
        describe: 'Google Cloud Storage bucket to use.',
    })
    .option('project-id', {
        alias: 'p',
        default: 'fiaas-gke',
        describe: 'Google Cloud Storage projectId.',
    })
    .argv;

function loadCredentials (args) {
    if (args.keyFilename) {
        return require(args.keyFilename);
    } else if (args.credentials) {
        try {
            return JSON.parse(args.credentials.replace(/\\n/g, 'n'));
        } catch (err) {
            console.error('Unable to parse credentials string');
            process.exit(1);
        }
    } else {
        console.error('You must either specify the key-filename or the credentials string to authenticate with GCE');
        process.exit(1);
    }
}

function getOptions (args) {
    const credentials = loadCredentials(args);
    const assetsFolder = args._[0];
    return Object.assign({}, args, { credentials, assetsFolder });
}

const options = getOptions(argv);

uploader.upload(options, (err, uploadedAssets) => {
    if (err) {
        throw err;
    } else {
        console.log('---Uploaded assets---');
        uploadedAssets.forEach(item => console.log(item.destination));
    }
});
