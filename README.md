# cdn-uploader
Small tool uploading assets to CDN backend (gke-storage)

## Requirements
You must set the `GOOGLE_APPLICATION_CREDENTIAL` environment variable to point to the google 
json based keyfile containing credentials talking to GKE.   

## Usage

```bash
$ npm install cdn-uploader -g

$ cdn-uploader -a finnlet-server -f /tmp/cdnAssets
-- Uploaded assets -- 
testApp/example.jpg
testApp/css/SDFSDF.finn.css
testApp/js/SDFSDF.finn.js
```