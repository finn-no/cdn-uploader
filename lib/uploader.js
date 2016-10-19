'use strict';

const gks = require('@google-cloud/storage');
const { isDirectory, getFilesToUpload } = require('./file-util');

function uploadToGKS (bucket, cacheControl, asset) {
    const uploadOpt = {
        destination: asset.destination,
        public: true,
        metadata: { cacheControl },
    };
    return bucket.upload(asset.path, uploadOpt);
}

function uploadToCloud (options, assets) {
    const storage = gks({
        projectId: options.projectId,
        credentials: options.credentials,
    });

    const bucket = storage.bucket(options.bucketName);

    return Promise.all(assets
        .map(asset => Object.assign({}, asset, { destination: `${options.appPrefix}/${asset.name}` }))
        .map(asset => uploadToGKS(bucket, options.cacheControl, asset)));
}

function upload (options) {
    if (!isDirectory(options.assetsFolder)) {
        throw new Error('Assets folder must be directory');
    }
    const assets = getFilesToUpload(options.assetsFolder);

    return uploadToCloud(options, assets);
}

module.exports = { upload };
