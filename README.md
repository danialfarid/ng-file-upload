angular-file-upload
===================


**Click here for <a href="http://angular-file-upload.appspot.com/" target="_blank">DEMO</a>**

Lightweight Angular JS directive to upload files. Features:
* File upload for HTML5 and non-HTML5 browsers with Flash polyfill [FileAPI](https://github.com/mailru/FileAPI). Allows client side validation before uploading the file
* Uses regular `$http` to upload (with shim for non-HTML5 browsers) so all angular `$http` features are available
* Supports upload progress
* Supports cancel/abort upload while in progress
* Supports File drag and drop
* All non-HTML5 code is in a separate shim file and could be easily removed if you only supports HTML5
* Flash FileAPI will be loaded on demand for non-HTML5 FormData browsers so no extra load for HTML5 browsers.
* `$upload` method can be configured to be either `POST` or `PUT` for HTML5 browsers.

## Usage

HTML:
```html
<script src="angular-file-upload-shim.min.js"></script> <!--only needed if you support upload progress/abort or non HTML5 FormData browsers.-->
<!-- NOTE: angular.file-upload-shim.js MUST BE PLACED BEFORE angular.js-->
<script src="angular.min.js"></script>
<script src="angular-file-upload.min.js"></script> <!--place after angular.js-->

<div ng-controller="MyCtrl">
  <input type="text" ng-model="myModelObj">
  <input type="file" ng-file-select="onFileSelect($files)" >
  <input type="file" ng-file-select="onFileSelect($files)" multiple>
  <div ng-file-drop="onFileSelect($files)" ng-file-drag-over-class="optional-css-class"
        ng-show="dropSupported">drop files here</div>
  <div ng-file-drop-available="dropSupported=true" 
        ng-show="!dropSupported">HTML5 Drop File is not supported!</div>
  <button ng-click="upload.abort()">Cancel Upload</button>
</div>
```

JS:
```js
//inject angular file upload directives and service.
angular.module('myApp', ['angularFileUpload']);

var MyCtrl = [ '$scope', '$upload', function($scope, $upload) {
  $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var $file = $files[i];
      $scope.upload = $upload.upload({
        url: 'server/upload/url', //upload.php script, node.js route, or servlet url
        // method: POST or PUT,
        // headers: {'headerKey': 'headerValue'}, withCredential: true,
        data: {myObj: $scope.myModelObj},
        file: $file,
        //(optional) set 'Content-Desposition' formData name for file
        //fileFormDataName: myFile,
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      });
      //.error(...).then(...); 
    }
  };
}];
```

Note: `angular.file-upload-shim.js` must be loaded before `angular.js` and is only needed if you are supporting non-HTML5 FormData browsers or you need the support for upload progress or cancel.


## Old browsers

For browsers not supporting HTML5 FormData (IE8, IE9, ...) [FileAPI](https://github.com/mailru/FileAPI) module is used. 
For these browsers these two files are needed:  **`FileAPI.min.js`, `FileAPI.flash.swf`** which will be loaded if the browser does not supports HTML5 FormData (no extra load for HTML5 browsers).
**Note**: Flash needs to be installed on the client browser since `FileAPI` uses Flash to upload files.

You can put these two files beside `angular-file-upload-shim(.min).js` on your server to be loaded automatically on demand or use the following script to set the FileAPI load path (optional):
```html
<script>
    //optional needs to be loaded before angular-file-upload-shim(.min).js
    FileAPI = {
        jsPath: '/js/FileAPI.min.js/folder/',
        staticPath: '/flash/FileAPI.flash.swf/folder/'
    }
</script>
<script src="angular.file-upload-shim.min.js"></script>...
```

## Install

The module is registered at bower with the name **`ng-file-upload`** (notice 'ng' at the beginning not 'angular'): 
```sh
bower install ng-file-upload
```

You can find the sample server code in Java/GAE [here](https://github.com/danialfarid/angular-file-upload/blob/master/src/com/df/angularfileupload/FileUpload.java).

If you use this module you can give it a thumbs up at [http://ngmodules.org/modules/angular-file-upload](http://ngmodules.org/modules/angular-file-upload).

Let [me](mailto:danial.farid@gmail.com) know if you have any questions. Bug report, feature request: [issue](https://github.com/danialfarid/angular-file-upload/issues).



