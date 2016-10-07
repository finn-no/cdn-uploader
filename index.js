#!/usr/bin/env node
'use strict';

const uploader = require('./uploader');
const argv = require('yargs')
    .usage('$0 <assetsFolder> [args]')
    .demand(1)
    .option('appPrefix', {
        alias: 'a',
        describe: 'Application prefix used in the CDN url',
        demand: true,
    })
    .option('keyFilename', {
        alias: 'k',
        describe: 'JSON key file used to authenticate with GCE. If not set FINN_CDN_UPLOADER_CREDENTIALS environment variable is used.',
    })
    .option('bucketName', {
        alias: 'b',
        default: 'fiaas-assets',
        describe: 'Google Cloud Storage bucket to use.',
    })
    .option('projectId', {
        alias: 'p',
        default: 'fiaas-gke',
        describe: 'Google Cloud Storage projectId.',
    })
    .argv;

function loadCredentials (keyFilename) {
    if (keyFilename) {
        return require(keyFilename);
    } else {
        try {
            const credentialString = process.env.FINN_CDN_UPLOADER_CREDENTIALS;
            return JSON.parse(credentialString.replace(/\\n/g, 'n'));
        } catch (err) {
            console.error('Unable to parse FINN_CDN_UPLOADER_CREDENTIALS and --keyFilename not set');
            process.exit(1);
        }
    }
}

function getOptions (args) {
    const credentials = loadCredentials(args.keyFilename);
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
