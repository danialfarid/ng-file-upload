angular-file-upload
===================

**Click here for <a href="http://angular-file-upload.appspot.com/" target="_blank">DEMO</a>**

CDN: [http//cdn.jsdelivr.net/angular.file-upload/0.1/angular-file-upload.js](//cdn.jsdelivr.net/angular.file-upload/0.1/angular-file-upload.js)

Lightweight Angular JS directive to upload files using regular input type file and ajax call.

HTML:
```html
<script src="angular.min.js"></script>
<script src="angular-file-upload.js"></script>

<div ng-controller="MyCtrl">
  <input type="text" ng-model="myModelObj">
  <input type="file" ng-file-select="onFileSelect($files)" >
  <input type="file" ng-file-select="onFileSelect($files)" multiple>
</div>
```

JS:
```js
//inject angular file upload directive.
angular.module('myApp', ['angularFileUpload']);

var MyCtrl = [ '$scope', '$http', function($scope, $http) {
  $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var $file = $files[i];
      $http.uploadFile({
        url: 'my/upload/url',
        data: {myObj: $scope.myModelObj}
        file: $file
      }).then(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      }); 
    }
  }
}];
```


You also need **FileAPI.min.js** and **FileAPI.flash.swf** files. They will be loaded on demand for the browsers that do not support HTML5 FormData. 
So they are just there for as polyfill for HTML5 and they will be ignored and not loaded if your browser already supports FormData.

If the above FileAPI files are put in a different path than angular-file-upload.js do the following step, unless they will be automatically loaded from the same location as angular-file-upload.js.
```script
<script>
    FileAPI = {
        staticPath: "path/to/fileapi/"
    }
</script>
```
This code needs to be before `<script src="angular-file-upload.js"></script>`

For browsers not supporting HTML5 FormData, [FileAPI](https://github.com/mailru/FileAPI) polyfill is used to upload file with Flash. Two extra files will be loaded for these browsers: FileAPI.min.js and FileAPI.flash.swf.
If JQuery is not included in your page then it will be loaded from google CDN for those browsers. 

The file will be send as *multipart/form-data* post request with form param name **file**.

Let [me](mailto:danial.farid@gmail.com) know if you see any bug or open an [issue](https://github.com/danialfarid/angular-file-upload/issues).

