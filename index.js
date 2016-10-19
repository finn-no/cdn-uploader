#!/usr/bin/env node
'use strict';

const uploader = require('./lib/uploader');
const argv = require('yargs')
    .usage('$0 [options] <assetsFolder>')
    .demand(1)
    .env('CDN_UPLOADER')
    .option('app-prefix', {
        alias: 'a',
        describe: 'Application prefix used in the CDN url',
        demand: true,
    })
    .option('key-filename', {
        alias: 'k',
        describe: `JSON key file used to authenticate with Google Cloud Platform.
        If not set, the credentials option is used.`,
    })
    .option('credentials', {
        alias: 'c',
        describe: `Stringified version of the JSON key file used to authenticate with Google Cloud Platform.
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
    .option('cache-control', {
        default: 'public, max-age=108000',
        describe: 'Override the cache-control header for the assets',
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
        console.error('You must either specify the key-filename or the credentials string to authenticate with Google Cloud Platform');
        process.exit(1);
    }
}

function getOptions (args) {
    const credentials = loadCredentials(args);
    const assetsFolder = args._[0];
    return Object.assign({}, args, { credentials, assetsFolder });
}

const options = getOptions(argv);

uploader.upload(options)
    .then(uploadedAssets => {
        console.log('---Uploaded assets---');
        uploadedAssets.map(item => item.destination).forEach(console.log);
    });
