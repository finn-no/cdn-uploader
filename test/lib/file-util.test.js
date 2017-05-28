import test from 'ava';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import fileUtil from '../../lib/file-util.js';

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

test.after.always(() => fs.remove(workPath));

test('should be a directory', t => {
    t.true(fileUtil.isDirectory(workPath));
});

test('file should not be a directory', t => {
    t.true(!fileUtil.isDirectory(file1));
});

test('unkown folder should not be a directory', t => {
    const folder = path.join(os.tmpdir(), '/random-blob-here');
    t.true(!fileUtil.isDirectory(folder));
});

test('should include all actual files', t => {
    const files = fileUtil.getFilesToUpload(workPath);
    t.true(files.length === 2);
    t.true(files[0].name === 'nested/test.txt');
    t.true(files[0].path === file2);
    t.true(files[1].name === 'test.txt');
    t.true(files[1].path === file1);
});

test('should flatten and include all actual files', t => {
    const files = fileUtil.getFilesToUpload(workPath, true);
    t.true(files.length === 2);
    t.true(files[0].name === 'test.txt');
    t.true(files[0].path === file2);
    t.true(files[1].name === 'test.txt');
    t.true(files[1].path === file1);
});

test('makeAbsolute', t => {
    const cwd = process.cwd();

    t.true(fileUtil.makeAbsolute() === cwd);
    t.true(fileUtil.makeAbsolute('./some-path') === `${cwd}/some-path`);
    t.true(fileUtil.makeAbsolute('/some-path') === '/some-path');
    t.true(fileUtil.makeAbsolute('some-path') === `${cwd}/some-path`);
});
