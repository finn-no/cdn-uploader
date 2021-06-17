const { Storage } = require('@google-cloud/storage');
const PromisePool = require('@supercharge/promise-pool');
const { isDirectory, makeAbsolute, getFilesToUpload } = require('./file-util');

function uploadToGCS(bucket, cacheControl, validate, resume, timeoutMs, asset) {
    const uploadOpt = {
        destination: asset.destination,
        validation: validate,
        resumable: resume,
        timeout: timeoutMs,
        public: true,
        gzip: true,
        metadata: { cacheControl },
    };
    return bucket.upload(asset.path, uploadOpt).then(() => asset);
}

async function uploadToCloud(options, assets) {
    const {
        projectId,
        credentials,
        bucketName,
        cacheControl,
        validation,
        resumable,
        timeout,
        batchSize,
    } = options;

    const storage = new Storage({
        projectId,
        credentials,
    });

    const bucket = storage.bucket(bucketName);

    return PromisePool
        .for(assets)
        .withConcurrency(batchSize)
        .process(async (asset) =>
            uploadToGCS(bucket, cacheControl, validation, resumable, timeout, asset)
        );
}

function getAllAssetsToUpload(options) {
    const assetsFolder = makeAbsolute(options.assetsFolder);

    if (!isDirectory(assetsFolder)) {
        throw new Error('Assets folder must be directory');
    }

    return getFilesToUpload(assetsFolder, options.flatten).map(asset =>
        ({ ...asset, destination: `${options.appPrefix}/${asset.name}`,})
    );
}

function upload(options) {
    const assets = getAllAssetsToUpload(options);
    console.log(`---Uploading ${assets.length} files---`)

    return uploadToCloud(options, assets);
}

module.exports = { getAllAssetsToUpload, upload };
