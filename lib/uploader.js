'use strict';

const gcs = require('@google-cloud/storage');
const { isDirectory, getFilesToUpload } = require('./file-util');

function uploadToGCS (bucket, cacheControl, asset) {
    const uploadOpt = {
        destination: asset.destination,
        public: true,
        metadata: { cacheControl },
    };
    return bucket.upload(asset.path, uploadOpt).then(() => Promise.resolve(asset));
}

function uploadToCloud (options, assets) {
    const storage = gcs({
        projectId: options.projectId,
        credentials: options.credentials,
    });

    const bucket = storage.bucket(options.bucketName);

    return Promise.all(assets
        .map(asset => Object.assign({}, asset, { destination: `${options.appPrefix}/${asset.name}` }))
        .map(asset => uploadToGCS(bucket, options.cacheControl, asset)));
}

function upload (options) {
    if (!isDirectory(options.assetsFolder)) {
        throw new Error('Assets folder must be directory');
    }
    const assets = getFilesToUpload(options.assetsFolder);

    return uploadToCloud(options, assets);
}

module.exports = { upload };
