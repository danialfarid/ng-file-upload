angular-file-upload
===================

Lightweight Angular JS directive to upload files using regular input type file and ajax call.

your html file:
```html
<script src="angular-file-upload.js"></script>

<div ng-controller="MyCtrl">
  <input type="file" ng-file-select="onFileSelect($files, myModelObj)" >
  <input type="file" ng-file-select="onMultiFileSelect($files, myModelObj)" multiple>
</div>
```

your js file:
```js
//inject angular file upload directive.
var app = angular.module('app', ['angularFileUpload']);

var MyCtrl = [ '$scope', '$http', function($scope, $http) {
  myModelObj = ...;

  $scope.onFileSelect = function($files, myModelObj) {
    $http.uploadFile({
      url: 'my/upload/url',
      file: $file[0] // for single file
      //files: $files  // for multiple files
    }).then(function(data) {
     myModelObj.fileId = data;
    }); 
  }
}
```

The *file* object contains *name, size, type* attributes.

You also need to have *FileAPI.min.js* and *FileAPI.flash.swf* on your server. They will be loaded on demand for the browsers that do not support HTML5 {{{FormData}}}.

You can set the base directory that these 2 files are loaded from like this:
```script
<script>
    FileAPI = {
        scriptBase: "../js/"
    }
</script>
```
This need to be placed before *angular-file-upload.js* is loaded.

If you put those two files beside *angular-file-upload.js* there is no need to have the above script, it will be automatically loaded.


If your browser is supporting HTML5 only the angular-file-upload.js is going to be loaded in the browser. You can merge it with your other js files to avoid an additional call to load this file if you wish.

If your browser does not support HMLT5 FormData, [FileAPI](https://github.com/mailru/FileAPI FileAPI) polyfill will be used to upload file with Flash. Two extra files will be loaded for those browsers: {{{FileAPI.min.js}}} and {{{FileAPI.flash.swf}}}, make sure you have them on your server.

On the server side the files will be send as multipart/form-data post request with parameter name *file* or *files* depending if you upload a single file or multiple files.


Let me know if you see any bug or if you like to contribute. Email me at [danial.farid](mailto:danial.farid@gmail.com)
