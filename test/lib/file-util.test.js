import test from 'ava';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import fileUtil from '../../lib/file-util.js';

const workPath = path.join(os.tmpdir(), 'cdn-test');
const file1 = path.join(workPath, 'test.txt');
const nested = path.join(workPath, 'nested');
const file2 = path.join(nested, 'test.js');
const ignoredFile = path.join(workPath, '.ignore.txt');

test.before(async () => {
    await fs.ensureDir(nested);

    await Promise.all([
        fs.writeFile(file1, 'woop'),
        fs.writeFile(file2, 'woop'),
        fs.writeFile(ignoredFile, ''),
    ]);
});

test.after.always(() => fs.remove(workPath));

test('should include all actual files', async t => {
    const files = await fileUtil.getFilesToUpload(
        { cwd: workPath, flatten: false },
        workPath
    );
    t.deepEqual(files, [
        { name: 'nested/test.js', path: file2 },
        { name: 'test.txt', path: file1 },
    ]);
});

test('should flatten and include all actual files', async t => {
    const files = await fileUtil.getFilesToUpload(
        { cwd: workPath, flatten: true },
        workPath
    );
    t.deepEqual(files, [
        { name: 'test.js', path: file2 },
        { name: 'test.txt', path: file1 },
    ]);
});

test('should include all actual files matching pattern', async t => {
    const files = await fileUtil.getFilesToUpload(
        { cwd: workPath, flatten: false },
        `${workPath}/**/*.js`
    );
    t.deepEqual(files, [{ name: 'nested/test.js', path: file2 }]);
});
