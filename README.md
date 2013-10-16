angular-file-upload
===================

New in version 1.0.0:
* File upload progress support.
* File drag and drop support. 


**Click here for <a href="http://angular-file-upload.appspot.com/" target="_blank">DEMO</a>**

Lightweight Angular JS directive to upload files using regular input type file or drag&drop file and ajax call.

HTML:
```html
<script src="angular.min.js"></script>
<script src="angular-file-upload.js"></script>

<div ng-controller="MyCtrl">
  <input type="text" ng-model="myModelObj">
  <input type="file" ng-file-select="onFileSelect($files)" >
  <input type="file" ng-file-select="onFileSelect($files)" multiple>
  <div class="drop-box" ng-file-drop="onFileSelect($files);">drop files here</div>
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
        url: 'server/upload/url', //upload.php script, node.js route, or servlet upload url)
        // headers: {'optional', 'value'}
        data: {myObj: $scope.myModelObj},
        file: $file
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).then(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      }); 
    }
  }
}];
```


For the browsers not supporting HTML5 FormData you need [FileAPI](https://github.com/mailru/FileAPI) files **FileAPI.min.js** and **FileAPI.flash.swf** as a polyfill. These files will not be loaded to the client if the browser supports HTML5 FormData (no extra load).
**Note**: Flash needs to be installed on the client browser if it doesn't support HTML5. 

You can put **FileAPI.min.js** and flash files beside angular-file-upload.js on your server so they will be loaded automatically. Alternatively you can use the following script to set the FileAPI load path:
```script
<script>
    FileAPI = {
        jsPath: "/js/path/to/FileAPI.min.js,
        staticPath: "/flash/path/to/FileAPI.flash.swf"
    }
</script>
```
This needs to be loaded before angular-file-upload.js (place before `<script src="angular-file-upload.js"></script>`)

You can find the sample server code in Java/GAE [here](https://github.com/danialfarid/angular-file-upload/blob/master/src/com/df/angularfileupload/FileUpload.java).

If you wish to use CDN to include the script files you can use this CDN: [http//cdn.jsdelivr.net/angular.file-upload/1.0.2/angular-file-upload.js](//cdn.jsdelivr.net/angular.file-upload/1.0.2/angular-file-upload.js) 
If you use this CDN you need to add a crossdomain.xml file to your root server in order for the Adbobe Flash to be able to upload the file for browsers not supporting FormData.

crossdomain.xml (Only needed if you are using CDN instead of having the js/swf files on your server)
```crossdomain.xml
<?xml version="1.0" ?>
<cross-domain-policy>
<allow-access-from domain="cdn.jsdelivr.net" />
</cross-domain-policy>
```

If you use this module you can give it a thumbs up at [http://ngmodules.org/modules/angular-file-upload](http://ngmodules.org/modules/angular-file-upload).
The module is registered at bower with the name **"angularjs-file-upload"** (notice 'js' after angular): bower install angularjs-file-upload#1.0.2

Let [me](mailto:danial.farid@gmail.com) know if you see any bug or open an [issue](https://github.com/danialfarid/angular-file-upload/issues).



