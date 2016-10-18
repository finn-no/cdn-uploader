# cdn-uploader
Small tool uploading assets to CDN backend (gke-storage)

## Requirements
You must either specify key-filename or specify credentials which is a
`JSON.stringify` version of the JSON based keyfile containing credentials 
used when talking to GCE.

## Usage

Install:
```bash
$ npm install cdn-uploader -g
```

Actual usage:
```bash
$ cdn-uploader /tmp/cdn-assets -a finnlet-server
-- Uploaded assets --
test-app/example.jpg
test-app/css/SDFSDF.finn.css
test-app/js/SDFSDF.finn.js
```

Get help:
```bash
$ cdn-uploader -h
cdn-uploader [options] <assetsFolder>

Options:
  --app-prefix, -a    Application prefix used in the CDN url          [required]
  --key-filename, -k  JSON key file used to authenticate with GCE. If not set,
                      the credentials option is used.
  --credentials, -c   Stringified version of the JSON key file used to
                      authenticate with GCE.
                      Can also be set as CDN_UPLOADER_CREDENTIALS environment
                      variable
  --bucket-name, -b   Google Cloud Storage bucket to use.
                                                       [default: "fiaas-assets"]
  --project-id, -p    Google Cloud Storage projectId.     [default: "fiaas-gke"]
  --cache-control     Overide the cache-control header for the assets
                                             [default: "public, max-age=108000"]
```

All options can also be set as environment variables, using the `CDN_UPLOADER_` prefix. 
E.g.: `CDN_UPLOADER_APP_PREFIX`, `CDN_UPLOADER_CREDENTIALS`, etc.

### Excluded files
All files or folder beginning with a "." is automatically excluded (e.g. `.gitignore`) and will not be uploaded.

### Advanced
You may also override other options if you like (handy for testing)

- `--key-filename` - JSON key file used to authenticate with GKE. If not set FINN_CDN_UPLOADER_CREDENTIALS environment variable is used.
- `--bucket-name` - GKE storage bucket to use.
- `--project-id` - GKE storage projectId.

You can also use environment variables for these options, just use the prefix `CDN_UPLOADER_`.

## Where does my files end up?
The files uploaded to GKE is made available on the public google storage hosting at:

`https://storage.googleapis.com/<bucket-name>/<app-prefix>/<assetName>`

This is again exposed by our CDN at:

`https://static.finncdn.no/_c/<app-prefix>/<assetName>`


## Cache time?
All files uploaded to CDN is configured with `Cache-Control: public, max-age=108000`,
meaning all your assets will be cached in 30 days.
