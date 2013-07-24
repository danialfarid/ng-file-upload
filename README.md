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

The **file** object contains **name, size, type** attributes.

You also need **FileAPI.min.js** and **FileAPI.flash.swf** files. They will be loaded on demand for the browsers that do not support HTML5 FormData. 
So they are just there for the polyfill of HTML5 and they will be ignored and not loaded if your browser already supports FormData.

If the above FileAPI files are put in a different path than angular-file-upload.js do the following step, unless they will be automatically loaded from the same location as angular-file-upload.js.
You can set the base directory that these two files are loaded from like this:
```script
<script>
    FileAPI = {
        scriptBase: "../js/"
    }
</script>
```
This code needs to be before *<script src="angular-file-upload.js"></script>* and will load FileAPI from *<script src="../js/FileAPI.min.js"></script>*


For browsers not supporting HTML5 FormData, [FileAPI](https://github.com/mailru/FileAPI) polyfill is used to upload file with Flash. Two extra files will be loaded for these browsers: FileAPI.min.js and FileAPI.flash.swf.

On the server side the files will be send as *multipart/form-data* post request with parameter name **file** or **files** depending if you upload a single file or multiple files.


Let [me](mailto:danial.farid@gmail.com) know if you see any bug or if you like to contribute.
