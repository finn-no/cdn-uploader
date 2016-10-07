#!/usr/bin/env node
'use strict';

const uploader = require('./uploader');
const argv = require('yargs')
    .usage('cdn-uploader -a <appPrefix> -f <dir>')
    .default({ bucketName: 'fiaas-assets', projectId: 'fiaas-gke' })
    .option('appPrefix', {
        alias: 'a',
        describe: 'Application prefix used in the CDN url',
        demand: true,
    })
    .option('assetsFolder', {
        alias: 'f',
        describe: 'Folder contaning the assets that should be uploaded',
        demand: true,
    })
    .option('keyFilename', {
        alias: 'k',
        describe: 'JSON key file used to authenticate with GKE. If not set FINN_CDN_UPLOADER_CREDENTIALS environment variable is used.',
    })
    .option('bucketName', {
        alias: 'b',
        describe: 'GKE storage bucket to use.',
    })
    .option('projectId', {
        alias: 'p',
        describe: 'GKE storage projectId.',
    })
    .argv;

function getOptions (opt) {
    const credentials = opt.keyFilename ? require(opt.keyFilename) :
        JSON.parse(process.env.FINN_CDN_UPLOADER_CREDENTIALS.replace(/\\n/g, 'n'));
    return Object.assign({}, opt, { credentials });
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
