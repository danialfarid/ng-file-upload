angular-file-upload
===================

**Click here for <a href="http://angular-file-upload.appspot.com/" target="_blank">DEMO</a>**

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

The js file **FileAPI.min.js** must be placed beside angular-file-upload.js. If the swf file **FileAPI.flash.swf** is placed in another directory on the server do the following step, unless they will be automatically loaded from the same location as angular-file-upload.js.
```script
<script>
    FileAPI = {
        staticPath: "/flash/path/to/fileapi/swf/" //the path to load swf file (optional)
    }
</script>
```
This code needs to be before `<script src="angular-file-upload.js"></script>`

For browsers not supporting HTML5 FormData, [FileAPI](https://github.com/mailru/FileAPI) polyfill is used to upload file with Flash. Two extra files will be loaded for these browsers: FileAPI.min.js and FileAPI.flash.swf.
If JQuery is not included in your page then it will be loaded from google CDN for those browsers.

You can find the sample server code in Java/GAE [here](https://github.com/danialfarid/angular-file-upload/blob/master/src/com/df/angularfileupload/FileUpload.java).

There is a CDN available here: [http//cdn.jsdelivr.net/angular.file-upload/0.1.1/angular-file-upload.js](//cdn.jsdelivr.net/angular.file-upload/0.1.1/angular-file-upload.js) 
If you wish to use this CDN you need to add a crossdomain.xml file to your root server in order for the Adbobe Flash to be able to upload the file for IE.

crossdomain.xml
```crossdomain.xml
<?xml version="1.0" ?>
<cross-domain-policy>
<allow-access-from domain="cdn.jsdelivr.net" />
</cross-domain-policy>
```

Let [me](mailto:danial.farid@gmail.com) know if you see any bug or open an [issue](https://github.com/danialfarid/angular-file-upload/issues).



