# cdn-uploader
Small tool uploading assets to CDN backend (gke-storage)

## Requirements
You must either specify keyfile or set the `FINN_CDN_UPLOADER_CREDENTIALS` environment variable which is a
`JSON.stringify` version of the JSON based keyfile containing credentials talking to GKE.

## Usage

Install:
```bash
$ npm install cdn-uploader -g
```

Actual usage:
```bash
$ cdn-uploader /tmp/cdnAssets -a finnlet-server
-- Uploaded assets --
testApp/example.jpg
testApp/css/SDFSDF.finn.css
testApp/js/SDFSDF.finn.js
```

Get help:
```bash
$ cdn-uploader -h
cdn-uploader <assetsFolder> [args]

Options:
  --appPrefix, -a    Application prefix used in the CDN url           [required]
  --keyFilename, -k  JSON key file used to authenticate with GCE. If not set
                     FINN_CDN_UPLOADER_CREDENTIALS environment variable is used.
  --bucketName, -b   Google Cloud Storage bucket to use.
                                                       [default: "fiaas-assets"]
  --projectId, -p    Google Cloud Storage projectId.      [default: "fiaas-gke"]
```

### Excluded files
All files or folder beginning with a "." is automatically excluded (e.g. `.gitignore`) and will not be uploaded.

### Advanced
You may also override other options if you like (handy for testing)

- `--keyFilename` - JSON key file used to authenticate with GKE. If not set FINN_CDN_UPLOADER_CREDENTIALS environment variable is used.
- `--bucketName` - GKE storage bucket to use.
- `--projectId` - GKE storage projectId.

You can also use environment variables for these options, just use the prefix `CDN_UPLOADER_`.

## Where does my files end up?
The files uploaded to GKE is made available on the public google storage hosting at:

`https://storage.googleapis.com/fiaas-assets/<appPrefix>/<assetName>`

This is again exposed by our CDN at:

`https://static.finncdn.no/_c/<appPrefix>/<assetName>`


## Cache time?
All files uploaded to CDN is configured with `Cache-Control: public, max-age=108000`,
meaning all your assets will be cached in 30 days.
