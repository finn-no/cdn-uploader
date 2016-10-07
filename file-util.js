'use strict';

const fs = require('fs');
const path = require('path');

function isDirectory (dir) {
    return fs.lstatSync(dir).isDirectory();
}

function getFilesToUpload (assetsFolder, subDir = '') {
    return fs.readdirSync(assetsFolder).reduce((list, file) => {
        const asset = {
            name: `${subDir}${file}`,
            path: path.join(assetsFolder, file),
        };
        return list.concat(isDirectory(asset.path) ? getFilesToUpload(asset.path, `${asset.name}${path.sep}`) : [asset]);
    }, []);
}


module.exports = { isDirectory, getFilesToUpload };
