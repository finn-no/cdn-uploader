'use strict';

const gcs = require('@google-cloud/storage');
const { isDirectory, makeAbsolute, getFilesToUpload } = require('./file-util');

function uploadToGCS (bucket, cacheControl, asset) {
    const uploadOpt = {
        destination: asset.destination,
        public: true,
        metadata: { cacheControl },
    };
    return bucket.upload(asset.path, uploadOpt).then(() => asset);
}

function uploadToCloud (options, assets) {
    const storage = gcs({
        projectId: options.projectId,
        credentials: options.credentials,
    });

    const bucket = storage.bucket(options.bucketName);

    return Promise.all(assets.map(asset => uploadToGCS(bucket, options.cacheControl, asset)));
}

function getAllAssetsToUpload (options) {
    const assetsFolder = makeAbsolute(options.assetsFolder);

    if (!isDirectory(assetsFolder)) {
        throw new Error('Assets folder must be directory');
    }

    return getFilesToUpload(assetsFolder)
        .map(asset => Object.assign({}, asset, { destination: `${options.appPrefix}/${asset.name}` }));
}

function upload (options) {
    const assets = getAllAssetsToUpload(options);

    return uploadToCloud(options, assets);
}

module.exports = { getAllAssetsToUpload, upload };
