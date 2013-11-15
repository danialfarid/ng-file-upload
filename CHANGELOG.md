# Changelog

## 1.1.5 2013-11-08
Fixed #46 #40 #38, moved demo to a separate folder

## 1.1.4 2013-11-08
Fixed #38 #40

## 1.1.3 2013-11-07
Fixed #37 #39

## 1.1.2 - 2013-11-05
upload.abort() to cancel the upload in progress.
issue #34
issue #35
issue #36

## 1.1.1 - 2013-10-28
Fixed progress bar to work with the latest angular 1.2.0-rc.3.
Added fileFormDataName to set the name of the Content-Disposition formData.
You can now upload the same file twice: pull request #27

## 1.1.0 - 2013-10-28
upload is now done with regular angular $http.post for HTML5 browsers so all angular $http features are available.
Added $upload as an angular service.
All the code for non HTML5 browsers and upload progress are moved to a separate shim file, the actual directive just uses html5 code. So if you only suppost HTML5 browsers you don't need to load shim js file.
angular-file-upload-shim.js needs to be loaded before angular.js if you need to support upload progress or browsers not supporting HTML5 FormData.
progress event is part of the upload config params instead of promise call.

## 1.0.1 - 2013-10-16
- Added fileFormDataName to config to be able to set the Content-Disposition formData name for the uploaded file

## 1.0.0 - 2013-10-15
- file upload progress support
- file drag and drop support

