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
    const {
        projectId,
        credentials,
        bucketName,
        cacheControl,
    } = options;

    const storage = gcs({
        projectId,
        credentials,
    });

    const bucket = storage.bucket(bucketName);

    return Promise.all(assets.map(asset => uploadToGCS(bucket, cacheControl, asset)));
}

function getAllAssetsToUpload (options) {
    const assetsFolder = makeAbsolute(options.assetsFolder);

    if (!isDirectory(assetsFolder)) {
        throw new Error('Assets folder must be directory');
    }

    return getFilesToUpload(assetsFolder, options.flatten)
        .map(asset => Object.assign({}, asset, { destination: `${options.appPrefix}/${asset.name}` }));
}

function upload (options) {
    const assets = getAllAssetsToUpload(options);

    return uploadToCloud(options, assets);
}

module.exports = { getAllAssetsToUpload, upload };
