#!/usr/bin/env node
'use strict';

const argv = require('yargs')
    .usage('cdn-uploader -a <appPrefix> -f <dir>')
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
    .argv;

const uploader = require('./uploader');

uploader.upload(argv.appPrefix, argv.assetsFolder, (err, uploadedAssets) => {
    if (err) {
        throw err;
    } else {
        console.log('-- Uploaded assets -- ');
        uploadedAssets.forEach(item => console.log(item.destination));
    }
});
