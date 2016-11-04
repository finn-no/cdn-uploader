'use strict';

const path = require('path');
const read = require('fs-readdir-recursive');

function makeAbsolute (filePath = '') {
    return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
}

function getFilesToUpload (assetsFolder) {
    return read(assetsFolder).map(file => ({
        name: path.basename(file),
        path: path.join(assetsFolder, file),
    }));
}

module.exports = { makeAbsolute, getFilesToUpload };
