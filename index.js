#!/usr/bin/env node
'use strict';

const argv = require('yargs')
    .usage('$0 [options] <assetsFolder>')
    .demand(1)
    .env('CDN_UPLOADER')
    .option('app-prefix', {
        alias: 'a',
        describe: 'Application prefix used in the CDN url',
        demand: true,
        type: 'string',
    })
    .option('key-filename', {
        alias: 'k',
        describe: `JSON key file used to authenticate with Google Cloud Platform.
        If not set, the credentials option is used.`,
        type: 'string',
    })
    .option('credentials', {
        alias: 'c',
        describe: `Stringified and base64 encoded version of the JSON key file used to authenticate with Google Cloud Platform.
        Can also be set as CDN_UPLOADER_CREDENTIALS environment variable`,
        type: 'string',
    })
    .option('bucket-name', {
        alias: 'b',
        default: 'fiaas-assets',
        describe: 'Google Cloud Storage bucket to use.',
        type: 'string',
    })
    .option('project-id', {
        alias: 'p',
        default: 'fiaas-gke',
        describe: 'Google Cloud Storage projectId.',
        type: 'string',
    })
    .option('cache-control', {
        default: 'public, max-age=108000',
        describe: 'Override the cache-control header for the assets',
        type: 'string',
    })
    .option('dry-run', {
        alias: 'n',
        describe: 'Print a list of which files would be uploaded',
        type: 'boolean',
    })
    .help()
    .version()
    .alias('help', ['h', '?'])
    .alias('version', 'v')
    .argv;

const updateNotifier = require('update-notifier');
const { upload, getAllAssetsToUpload } = require('./lib/uploader');
const pkg = require('./package.json');

updateNotifier({ pkg }).notify();

function loadCredentials (args) {
    if (args.keyFilename) {
        return require(args.keyFilename);
    } else if (args.credentials) {
        try {
            return JSON.parse(new Buffer(args.credentials, 'base64').toString('utf8'));
        } catch (err) {
            console.error('Unable to parse credentials string', err);
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

const getGoogleUrl = dest => `https://storage.googleapis.com/${options.bucketName}/${dest}`;

if (argv.dryRun) {
    // Lazy load these deps
    const { blue, yellow, green } = require('chalk');
    const table = require('text-table');

    const text = getAllAssetsToUpload(options)
        .map(({ path, destination }) => ({ file: path, destination: getGoogleUrl(destination) }))
        .map(({ file, destination }) => [blue(file), yellow('->'), green(destination)]);

    console.log('---Files that would be uploaded---');
    console.log(table(text));

    return;
}

upload(options)
    .then(uploadedAssets => {
        console.log('---Uploaded assets---');
        uploadedAssets
            .map(item => item.destination)
            .map(getGoogleUrl)
            .forEach(s => console.log(s));
    });
