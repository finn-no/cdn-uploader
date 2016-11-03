# cdn-uploader
> Small tool uploading assets to CDN backend (Google Cloud Storage)

[![Build Status](https://travis-ci.org/finn-no/cdn-uploader.svg?branch=master)](https://travis-ci.org/finn-no/cdn-uploader)

## Requirements
You must either specify key-filename or specify credentials which is a
base64 encoded `JSON.stringify` version of the JSON based keyfile containing credentials 
used when talking to Google Cloud Storage (GCS).

```javascript
//base 64 encoded keyfile
const credentials = require('keyfile.json');
const credentialString = JSON.stringify(credentials);
return new Buffer(credentialString).toString('base64');
```

## Usage

Install:
```sh-session
$ npm install cdn-uploader -g
```

Actual usage:
```sh-session
$ cdn-uploader /tmp/cdn-assets -a test-app
-- Uploaded assets --
test-app/example.jpg
test-app/css/SDFSDF.finn.css
test-app/js/SDFSDF.finn.js
```

Get help:
```sh-session
$ cdn-uploader -h
cdn-uploader [options] <assetsFolder>

Options:
  --app-prefix, -a    Application prefix used in the CDN url [string] [required]
  --key-filename, -k  JSON key file used to authenticate with Google Cloud
                      Platform.
                      If not set, the credentials option is used.       [string]
  --credentials, -c   Stringified and base64 encoded version of the JSON key
                      file used to authenticate with Google Cloud Platform.
                      Can also be set as CDN_UPLOADER_CREDENTIALS environment
                      variable                                          [string]
  --bucket-name, -b   Google Cloud Storage bucket to use.
                                              [string] [default: "fiaas-assets"]
  --project-id, -p    Google Cloud Storage projectId.
                                                 [string] [default: "fiaas-gke"]
  --cache-control     Override the cache-control header for the assets
                                    [string] [default: "public, max-age=108000"]
  --dry-run, -n       Print a list of which files would be uploaded    [boolean]
  --help, -h, -?      Show help                                        [boolean]
  --version, -v       Show version number                              [boolean]
```

All options can also be set as environment variables, using the `CDN_UPLOADER_` prefix. 
E.g.: `CDN_UPLOADER_APP_PREFIX`, `CDN_UPLOADER_CREDENTIALS`, etc.

### Excluded files
All files or folder beginning with a "." is automatically excluded (e.g. `.gitignore`) and will not be uploaded.

### Advanced
You may also override other options if you like (handy for testing)

- `--key-filename` - JSON key file used to authenticate with GCP. If not set CDN_UPLOADER_CREDENTIALS environment variable is used.
- `--bucket-name` - GCS bucket to use.
- `--project-id` - GCS projectId.

You can also use environment variables for these options, just use the prefix `CDN_UPLOADER_`.

## Where does my files end up?
The files uploaded to GCS is made available on the public GCS hosting at:

`https://storage.googleapis.com/<bucket-name>/<app-prefix>/<assetName>`

This is again exposed by our CDN at:

`https://static.finncdn.no/_c/<app-prefix>/<assetName>`


## Cache time?
All files uploaded to CDN is configured with `Cache-Control: public, max-age=108000`,
meaning all your assets will be cached in 1.25 days.
