'use strict';

const async = require('async');
const gks = require('@google-cloud/storage');
const { isDirectory, getFilesToUpload } = require('./file-util');

function uploadToGKS (bucket, asset, cb) {
    const uploadOpt = {
        destination: asset.destination,
        public: true,
        metadata: { cacheControl: 'public, max-age=108000' },
    };
    bucket.upload(asset.path, uploadOpt, (err) => cb(err, asset));
}

function uploadToCloud (options, assets, cb) {
    const storage = gks({
        projectId: options.projectId,
        credentials: options.credentials,
    });

    const bucket = storage.bucket(options.bucketName);

    const uploadRequests = assets
        .map(a => Object.assign({}, a, { destination: `${options.appPrefix}/${a.name}` }))
        .map(a => uploadToGKS.bind(null, bucket, a));

    async.parallel(uploadRequests, cb);
}

function upload (options, cb) {
    if (!isDirectory(options.assetsFolder)) {
        throw new Error('Assets folder must be directory');
    }
    const assets = getFilesToUpload(options.assetsFolder);
    uploadToCloud(options, assets, cb);
}

module.exports = { upload };
