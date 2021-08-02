import test from 'ava';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import fileUtil from '../../lib/file-util';

const workPath = path.join(os.tmpdir(), 'cdn-test');
const file1 = path.join(workPath, 'test.txt');
const nested = path.join(workPath, 'nested');
const file2 = path.join(nested, 'test.txt');
const ignoredFile = path.join(workPath, '.ignore.txt');

test.before(async () => {
    await fs.ensureDir(nested);

    await Promise.all([
        fs.writeFile(file1, 'woop'),
        fs.writeFile(file2, 'woop'),
        fs.writeFile(ignoredFile, ''),
    ]);
});

test.after.always(async () => {
    await fs.rm(workPath, { recursive: true, force: true })
});

test('should be a directory', t => {
    t.assert(fileUtil.isDirectory(workPath));
});

test('file should not be a directory', t => {
    t.assert(!fileUtil.isDirectory(file1));
});

test('unkown folder should not be a directory', t => {
    const folder = path.join(os.tmpdir(), '/random-blob-here');
    t.assert(!fileUtil.isDirectory(folder));
});

test('should include all actual files', t => {
    const files = fileUtil.getFilesToUpload(workPath);
    t.deepEqual(files, [
        { name: 'nested/test.txt', path: file2 },
        { name: 'test.txt', path: file1 },
    ]);
});

test('should flatten and include all actual files', t => {
    const files = fileUtil.getFilesToUpload(workPath, true);
    t.deepEqual(files, [
        { name: 'test.txt', path: file2 },
        { name: 'test.txt', path: file1 },
    ]);
});

test('makeAbsolute', t => {
    const cwd = process.cwd();

    t.assert(fileUtil.makeAbsolute() === cwd);
    t.assert(fileUtil.makeAbsolute('./some-path') === `${cwd}/some-path`);
    t.assert(fileUtil.makeAbsolute('/some-path') === '/some-path');
    t.assert(fileUtil.makeAbsolute('some-path') === `${cwd}/some-path`);
});
