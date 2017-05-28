'use strict';

const { join, basename } = require('path');
const globby = require('globby');

function getFilesToUpload({ cwd, flatten }, ...globs) {
    const newGlobs = globs.map(glob => {
        if (globby.hasMagic(glob)) {
            return glob;
        }

        return join(glob, '**/*');
    });

    const pathReplacement = cwd.endsWith('/') ? cwd : `${cwd}/`;

    return globby(newGlobs, { nodir: true, cwd }).then(files =>
        files.map(path => {
            let name;

            if (flatten) {
                name = basename(path);
            } else {
                name = path.replace(pathReplacement, '');
            }

            return { name, path };
        })
    );
}

module.exports = { getFilesToUpload };
