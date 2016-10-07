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

## Where does my files end up?
The files uploaded to GKE is made available on the public google storage hosting at: 

`https://storage.googleapis.com/fiaas-assets/<appPrefix>/<assetName>`

This is again exposed by our CDN at:

`https://static.finncdn.no/_c/<appPrefix>/<assetName>`


## Cache time?
All files uploaded to CDN is configured with `Cache-Control: public, max-age=108000`, 
meaning all your assets will be cached in 30 days. 