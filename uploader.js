'use strict';

const fs = require('fs');
const path = require('path');
const async = require('async');
const gks = require('@google-cloud/storage');

const OPTIONS = {
    bucketName: 'fiaas-assets',
    projectId: 'fiaas-gke',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || `${__dirname}/config.json`,
};

const storage = gks({
    projectId: OPTIONS.bucketName,
    keyFilename: OPTIONS.keyFilename,
});

function isDirectory (dir) {
    return fs.lstatSync(dir).isDirectory();
}

function getFilesToUpload (assetsFolder, subDir = '') {
    return fs.readdirSync(assetsFolder).reduce((list, file) => {
        const asset = {
            name: `${subDir}${file}`,
            path: path.join(assetsFolder, file),
        };
        return list.concat(isDirectory(asset.path) ? getFilesToUpload(asset.path, `${asset.name}/`) : [asset]);
    }, []);
}

function uploadToGKS (bucket, asset, cb) {
    bucket.upload(asset.path, { destination: asset.destination, public: true }, (err) => cb(err, asset));
}

function uploadToCloud (appPrefix, assets, cb) {
    const bucket = storage.bucket(OPTIONS.bucketName);

    const uploadRequests = assets
        .map(a => Object.assign({}, a, { destination: `${appPrefix}/${a.name}` }))
        .map(a => uploadToGKS.bind(null, bucket, a));

    async.parallel(uploadRequests, cb);
}

function upload (appPrefix, assetsFolder, cb) {
    if (!isDirectory(assetsFolder)) {
        throw new Error('Assets folder must be directory');
    }
    const assets = getFilesToUpload(assetsFolder);
    uploadToCloud(appPrefix, assets, cb);
}

module.exports = { upload };
