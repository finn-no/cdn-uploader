import test from 'ava';
import os from 'os';
import fs from 'fs';
import path from 'path';
import fileUtil from '../../lib/file-util.js';

const workPath = path.join(os.tmpdir(), 'cdn-test');
const file1 = path.join(workPath, 'test.txt');
const ignoredFile = path.join(workPath, '.ignore.txt');

test.before(() => {
    fs.mkdirSync(workPath);
    fs.writeFileSync(file1, 'woop');
    fs.writeFileSync(ignoredFile, '');
});

test.after.always(() => {
    fs.unlinkSync(file1);
    fs.unlinkSync(ignoredFile);
    fs.rmdirSync(workPath);
});

test('should include all actual files', t => {
    const files = fileUtil.getFilesToUpload(workPath);
    t.deepEqual(files.length, 1);
    t.deepEqual(files[0].name, 'test.txt');
    t.deepEqual(files[0].path, file1);
});

test('makeAbsolute', t => {
    const cwd = process.cwd();

    t.true(fileUtil.makeAbsolute() === cwd);
    t.true(fileUtil.makeAbsolute('./some-path') === `${cwd}/some-path`);
    t.true(fileUtil.makeAbsolute('/some-path') === '/some-path');
    t.true(fileUtil.makeAbsolute('some-path') === `${cwd}/some-path`);
});
