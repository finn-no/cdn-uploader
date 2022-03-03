import test from 'ava';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';
import { upload } from '../../lib/uploader';

const { Storage } = require('@google-cloud/storage');

const workPath = path.join(os.tmpdir(), 'cdn-test');
const nested = path.join(workPath, 'nested');
const file1 = path.join(workPath, 'file1.txt');
const file2 = path.join(workPath, 'file2.txt');
const file3 = path.join(nested, 'file3.txt');

const bucket = sinon.stub(Storage.prototype, 'bucket')

test.before(async () => {
    await fs.ensureDir(nested);

    await Promise.all([
        fs.writeFile(file1, 'woop1'),
        fs.writeFile(file2, 'woop2'),
        fs.writeFile(file3, 'woop3'),
    ]);
});

test.after.always(async () => {
    await fs.rm(workPath, { recursive: true, force: true })
    sinon.restore()
});

test('should upload in batches', async t => {
    const times = [];

    bucket.callsFake(() => ({
        upload: () => {
            times.push(new Date())
            return new Promise(resolve => setTimeout(resolve, 10))
        }
    }));

    const { results: uploadedAssets, errors } = await upload({
        projectId: 'id',
        credentials: 'cred',
        bucketName: 'name',
        appPrefix: 'prefix',
        assetsFolder: workPath,
        batchSize: 2
    })

    t.assert(uploadedAssets.length === 3)
    t.assert(errors.length === 0)

    t.assert(times.length === 3)
    // The 2 first uploads are done at the same time (batch size == 2) and then the third is done later
    t.assert(times[1].getMilliseconds() - times[0].getMilliseconds() < 2)
    t.assert(times[2].getMilliseconds() - times[0].getMilliseconds() > 9)
})

test('should retry on errors in upload', async t => {
    let count = 0;

    bucket.callsFake(() => ({
        upload: () => {
            count += 1
            // Rejects the first upload of all 3 files and the second upload of the first file,
            // i.e. the second upload of the second & third file will not fail.
            return count < 5 ? Promise.reject() : Promise.resolve()
        }
    }));

    const { results: uploadedAssets, errors } = await upload({
        projectId: 'id',
        credentials: 'cred',
        bucketName: 'name',
        appPrefix: 'prefix',
        assetsFolder: workPath,
        batchSize: 5
    })

    t.assert(uploadedAssets.length === 2)
    t.assert(errors.length === 1)
})
