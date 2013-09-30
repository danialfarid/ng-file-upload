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
        url: 'server/upload/url', //upload.php script, node.js route, or servlet upload url)
        data: {myObj: $scope.myModelObj},
        file: $file
      }).then(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      }); 
    }
  }
}];
```


You also need **FileAPI.min.js** and **FileAPI.flash.swf** files as polyfill using Flash for browsers that does not support HTML5 FormData (i.e. IE9+).
For HTML5 FromData supported browsers they will be ignored (not loaded).
**Note**: IE8 is not supported since FileAPI doesn't support it. The good news is that google and github have dropped IE8 support too. 

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

If you wish to use CDN to include the script files you can use this CDN: [http//cdn.jsdelivr.net/angular.file-upload/0.1.4/angular-file-upload.js](//cdn.jsdelivr.net/angular.file-upload/0.1.1/angular-file-upload.js) 
 If you use this CDN you need to add a crossdomain.xml file to your root server in order for the Adbobe Flash to be able to upload the file for IE.

crossdomain.xml (Only needed if you are using CDN instead of having the js/swf files on your server)
```crossdomain.xml
<?xml version="1.0" ?>
<cross-domain-policy>
<allow-access-from domain="cdn.jsdelivr.net" />
</cross-domain-policy>
```

If you use this module you can give it a thumbs up at [http://ngmodules.org/modules/angular-file-upload](http://ngmodules.org/modules/angular-file-upload).
The module is registered at bower with the name **"angularjs-file-upload"** (notice 'js' after angular): bower install angularjs-file-upload#0.1.4

Let [me](mailto:danial.farid@gmail.com) know if you see any bug or open an [issue](https://github.com/danialfarid/angular-file-upload/issues).



