#!/usr/bin/env node
'use strict';

const program = require('commander');
const uploader = require('./uploader');

program
    .option('-a, --appPrefix <appPrefix>', 'The app prefix used for static assets')
    .option('-f, --assetsFolder <dir>', 'Folder contaning the assets that should be uploaded.')
    .parse(process.argv);

// Check input args
if (!program.appPrefix || !program.assetsFolder) {
    console.error('You must specify required args "appPrefix" and "assetsFolder"');
    process.exit(-1);
}


uploader.upload(program.appPrefix, program.assetsFolder, (err, uploadedAssets) => {
    if (err) {
        throw err;
    } else {
        console.log('-- Uploaded assets -- ');
        uploadedAssets.forEach(item => console.log(item.destination));
    }
});
