'use strict';

const fs = require('fs');
const path = require('path');
const read = require('fs-readdir-recursive');

function makeAbsolute(filePath = '') {
    return path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);
}

function isDirectory(dir) {
    try {
        return fs.lstatSync(dir).isDirectory();
    } catch (err) {
        return false;
    }
}

function getFilesToUpload(assetsFolder, flatten) {
    return read(assetsFolder).map(file => ({
        name: flatten ? path.basename(file) : file,
        path: path.join(assetsFolder, file),
    }));
}

module.exports = { makeAbsolute, isDirectory, getFilesToUpload };
