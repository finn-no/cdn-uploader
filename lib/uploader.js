const { Storage } = require('@google-cloud/storage');
const { PromisePool } = require('@supercharge/promise-pool');
const { isDirectory, makeAbsolute, getFilesToUpload } = require('./file-util');

function uploadToGCS(bucket, cacheControl, validate, resume, asset) {
    const uploadOpt = {
        destination: asset.destination,
        validation: validate,
        resumable: resume,
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
            uploadToGCS(bucket, cacheControl, validation, resumable, asset)
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

async function retry(errors, options) {
    const assetsToRetry = errors.map((error) => error.item);

    if (assetsToRetry.length !== 0) {
        console.log(`---Retrying ${assetsToRetry.length} files---`);
        return uploadToCloud(options, assetsToRetry);
    }

    return {results: [], errors: []}
}

async function upload(options) {
    const assets = getAllAssetsToUpload(options);

    console.log(`---Uploading ${assets.length} files---`);
    const {results: uploadedAssetsFirst, errors: errorsFirst} = await uploadToCloud(options, assets);

    const {results: uploadedAssetsRetried, errors: errorsRetried} = await retry(errorsFirst, options);

    return {results: uploadedAssetsFirst.concat(uploadedAssetsRetried), errors: errorsRetried};
}

module.exports = { getAllAssetsToUpload, upload };
