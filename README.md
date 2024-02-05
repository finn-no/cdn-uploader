# cdn-uploader

:warning: **DEPRECATED:** This package is no longer actively maintained, and should not be used. Insead of `cdn-uploader`, use Eik to host your assets.

> Small tool uploading assets to CDN backend (Google Cloud Storage)

[![Build Status](https://travis-ci.org/finn-no/cdn-uploader.svg?branch=master)](https://travis-ci.org/finn-no/cdn-uploader)
[![Greenkeeper badge](https://badges.greenkeeper.io/finn-no/cdn-uploader.svg)](https://greenkeeper.io/)

## Requirements

You must either specify key-filename or specify credentials which is a base64
encoded `JSON.stringify` version of the JSON based keyfile containing
credentials used when talking to Google Cloud Storage (GCS).

```javascript
//base 64 encoded keyfile
const credentials = require('keyfile.json');
const credentialString = JSON.stringify(credentials);
return new Buffer(credentialString).toString('base64');
```

## Usage

Install:

```sh-session
$ npm install @finn-no/cdn-uploader -g
```

Actual usage:

```sh-session
$ cdn-uploader -a test-app /tmp/cdn-assets
-- Uploaded assets --
test-app/example.jpg
test-app/css/example.css
test-app/js/example.js
```

Get help:

```sh-session
$ cdn-uploader -h
cdn-uploader [options] <assetsFolder>

Options:
  -a, --app-prefix     Application prefix used in the CDN url[string] [required]
  -k, --key-filename   JSON key file used to authenticate with Google Cloud
                       Platform.
                       If not set, the credentials option is used.      [string]
  -c, --credentials    Stringified and base64 encoded version of the JSON key
                       file used to authenticate with Google Cloud Platform.
                       Can also be set as CDN_UPLOADER_CREDENTIALS environment
                       variable                                         [string]
  -b, --bucket-name    Google Cloud Storage bucket to use.
                                              [string] [default: "fiaas-assets"]
  -p, --project-id     Google Cloud Storage projectId.
                                                 [string] [default: "fiaas-gke"]
      --cache-control  Override the cache-control header for the assets
                                   [string] [default: "public, max-age=2592000"]
  -f, --flatten        Flatten filestructure          [boolean] [default: false]
  -n, --dry-run        Print a list of which files would be uploaded   [boolean]
  -r, --resumable      Resumable upload                [boolean] [default: true]
  -V, --validation     Validation for upload           [boolean] [default: true]
  -s, --batch-size     How many files to upload in each batch
                                                         [number] [default: 100]
  -h, -?, --help       Show help                                       [boolean]
  -v, --version        Show version number                             [boolean]
```

All options can also be set as environment variables, using the `CDN_UPLOADER_`
prefix. E.g.: `CDN_UPLOADER_APP_PREFIX`, `CDN_UPLOADER_CREDENTIALS`, etc.

### Excluded files

All files or folder beginning with a "." is automatically excluded (e.g.
`.gitignore`) and will not be uploaded.

### Advanced

You may also override other options if you like (handy for testing)

- `--key-filename` - JSON key file used to authenticate with GCP. If not set
  CDN_UPLOADER_CREDENTIALS environment variable is used.
- `--bucket-name` - GCS bucket to use.
- `--project-id` - GCS projectId.

You can also use environment variables for these options, just use the prefix
`CDN_UPLOADER_`.

## Where does my files end up?

The files uploaded to GCS is made available on the public GCS hosting at:

`https://storage.googleapis.com/<bucket-name>/<app-prefix>/<assetName>`

This is again exposed by our CDN at:

`https://static.finncdn.no/_c/<app-prefix>/<assetName>`

## Cache time?

All files uploaded to CDN is configured with
`Cache-Control: public, max-age=2592000`, meaning that clients may cache the
assets for up to 30 days.
