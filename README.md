angular-file-upload
===================

Lightweight Angular JS directive to upload files.<br/><br/>**Here is the <a href="https://angular-file-upload.appspot.com/" target="_blank">DEMO</a> page**.<br/> To support get me a <a target="_blank" href="https://angular-file-upload.appspot.com/donate.html">cup of tea <img src="https://angular-file-upload.appspot.com/img/tea.png" width="40" height="24" title="Icon made by Freepik.com"></a> or give it a thumbs up at [ngmodules](http://ngmodules.org/modules/angular-file-upload).


Table of Content:
* [Features](#features)
* [Usage](#usage)
* [Old Browsers](#old_browsers)
* [Server Side](#server)
* [Amazon S3 Upload](#s3)
* [Install (Bower)](#install)
* [Questions, Issues and Contribution](#contrib)

##<a name="features"></a> Features
* File upload for `HTML5` and `non-HTML5` browsers with Flash polyfill [FileAPI](https://github.com/mailru/FileAPI). Allows client side validation before uploading the file
* Uses regular `$http` to upload (with shim for non-HTML5 browsers) so all angular `$http` features are available
* Supports upload progress
* Supports cancel/abort upload while in progress
* Supports File drag and drop (HTML5 only)
* Supports Directory drag and drop (webkit only)
* Supports CORS
* All `non-HTML5` code is in a separate shim file and could be easily removed if you only supports `HTML5`. (html5-shim.js is needed for `progress` event though)
* Flash `FileAPI` will be loaded on demand for `non-HTML5` FormData browsers so no extra load for `HTML5` browsers.
* `$upload` method can be configured to be either `POST` or `PUT` for HTML5 browsers.
* `$upload.http()` enables progress event for angular http `POST`/`PUT` requests. You can upload file content with the `Content-Type` of the file to CouchDB, imgur, etc... for `HTML5` `FileReader` browsers. See [#88(comment)](https://github.com/danialfarid/angular-file-upload/issues/88#issuecomment-31366487) for discussion and usage.

##<a name="usage"></a> Usage

HTML:
```html
<!-- shim is needed to support upload progress/abort for HTML5 and non-HTML5 FormData browsers.-->
<!-- angular-file-upload-html5-shim.js could be used instead of angular-file-upload-shim if your app 
targets HTML5 browsers only (not IE8-9) -->
<!-- Note: shim.js MUST BE PLACED BEFORE angular.js and angular-file-upload.js AFTER angular.js-->
<script src="angular-file-upload-shim.min.js"></script> 
<script src="angular.min.js"></script>
<script src="angular-file-upload.min.js"></script> 

<div ng-controller="MyCtrl">
  <input type="text" ng-model="myModelObj">
  <input type="file" ng-file-select="onFileSelect($files)">
  <input type="file" ng-file-select="onFileSelect($files)" multiple accept="image/*">
  <div class="button" ng-file-select="onFileSelect($files)" data-multiple="true"></div>
  <div ng-file-drop="onFileSelect($files)" ng-file-drag-over-class="optional-css-class-name-or-function"
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
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: 'server/upload/url', //upload.php script, node.js route, or servlet url
        //method: 'POST' or 'PUT',
        //headers: {'header-key': 'header-value'},
        //withCredentials: true,
        data: {myObj: $scope.myModelObj},
        file: file, // or list of files ($files) for html5 only
        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
        // customize file formData name ('Content-Disposition'), server side file variable name. 
        //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file' 
        // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
        //formDataAppender: function(formData, key, val){}
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      });
      //.error(...)
      //.then(success, error, progress); 
      // access or attach event listeners to the underlying XMLHttpRequest.
      //.xhr(function(xhr){xhr.upload.addEventListener(...)})
    }
    /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
       It could also be used to monitor the progress of a normal http post/put request with large data*/
    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
  };
}];
```

**Order of scripts**: `angular-file-upload-shim.js` must be loaded before `angular.js` and is only needed if you are supporting non-HTML5 FormData browsers or you need to support upload progress or cancel.

**Upload multiple files**: Only for HTML5 FormData browsers (not IE8-9) if you pass an array of files to `file` option it will upload all of them together in one request. In this case the `fileFormDataName` could be an array of names or a single string. For Rails or depending on your server append square brackets to the end (i.e. `file[]`).
If you want a cross browser approach you need to iterate through files and upload them one by one like the code above. This is due to the limitation of Flash file upload.

**$upload.http()**: You can also use `$upload.http()` to send the file binary or any data to the server while being able to listen to progress event. See [#88](https://github.com/danialfarid/angular-file-upload/issues/88) for more details.
This equivalent to angular $http() but allow you to listen to progress event for HTML5 browsers.

**Rails progress event**: If your server is Rails and Apache you may need to modify server configurations for the server to support upload progress. See [#207](https://github.com/danialfarid/angular-file-upload/issues/207)

**drag and drop styling**: For file drag and drop, `ng-file-drag-over-class` can be a function that returns a class name based on the $event. See the demo for a sample. If the attribute is not specified by default the element will have "dragover" class on drag over which could be used to style the drop zone.
You can also specify `ng-file-drag-over-delay` to fix css3 transition issues from dragging over/out/over [#277](https://github.com/danialfarid/angular-file-upload/issues/277).

##<a name="old_browsers"></a> Old browsers

For browsers not supporting HTML5 FormData (IE8, IE9, ...) [FileAPI](https://github.com/mailru/FileAPI) module is used. 
For these browsers these two files are needed:  **`FileAPI.min.js`, `FileAPI.flash.swf`** which will be loaded if the browser does not supports HTML5 FormData (no extra load for HTML5 browsers).

**Note**: Flash needs to be installed on the client browser since `FileAPI` uses Flash to upload files.
**CORS**: To enable CORS
You can put these two files beside `angular-file-upload-shim(.min).js` on your server to be loaded automatically on demand or optionally you can use the following script to set the FileAPI load path if they are not at the same location:
```html
<script>
    //optional need to be loaded before angular-file-upload-shim(.min).js
    FileAPI = {
        //only one of jsPath or jsUrl.
        jsPath: '/js/FileAPI.min.js/folder/', 
        jsUrl: 'yourcdn.com/js/FileAPI.min.js',
        
        //only one of staticPath or flashUrl.
        staticPath: '/flash/FileAPI.flash.swf/folder/',
        flashUrl: 'yourcdn.com/js/FileAPI.flash.swf',

        //forceLoad: true, html5: false //to debug flash in HTML5 browsers
    }
</script>
<script src="angular-file-upload-shim.min.js"></script>...
```
**Old browsers known issues**: 
* Because of a Flash limitation/bug if the server doesn't send any response body the status code of the response will be always `204 'No Content'`. So if you have access to your server upload code at least return a character in the response for the status code to work properly.
* Custom headers will not work due to a Flash limitation [#111](https://github.com/danialfarid/angular-file-upload/issues/111) [#224](https://github.com/danialfarid/angular-file-upload/issues/224) [#129](https://github.com/danialfarid/angular-file-upload/issues/129)
* Due to Flash bug [#92](https://github.com/danialfarid/angular-file-upload/issues/92) Server HTTP error code 400 will be returned as 200 to the client. So avoid returning 400 on your server side for upload response otherwise it will be treated as a success response on the client side.
* In case of an error response (http code >= 400) the custom error message returned from the server may not be available. For some error codes flash just provide a generic error message and ignores the response text. [#310](https://github.com/danialfarid/angular-file-upload/issues/310)

##<a name="server"></a>Server Side
####CORS
To support CORS upload your server needs to allow cross domain requests. You can achive that by having a filter or interceptor on your upload file server to add CORS headers to the response similar to this:
([sample java code](https://github.com/danialfarid/angular-file-upload/blob/master/demo/src/com/df/angularfileupload/CORSFilter.java))
```java
httpResp.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS");
httpResp.setHeader("Access-Control-Allow-Origin", "your.other.server.com");
httpResp.setHeader("Access-Control-Allow-Headers", "Content-Type"));
```
For non-HTML5 IE8-9 browsers you would also need a `crossdomain.xml` file at the root of your server to allow CORS for flash:
<a name="crossdomain"></a>([sample xml](https://angular-file-upload.appspot.com/crossdomain.xml))
```xml
<cross-domain-policy>
  <site-control permitted-cross-domain-policies="all"/>
  <allow-access-from domain="angular-file-upload.appspot.com"/>
  <allow-http-request-headers-from domain="*" headers="*" secure="false"/>
</cross-domain-policy>
```

####Samples
* **Java/GAE**: You can find the sample server code in Java/GAE [here](https://github.com/danialfarid/angular-file-upload/blob/master/demo/src/com/df/angularfileupload/)
* **Node.js**: [Sample wiki page](https://github.com/danialfarid/angular-file-upload/wiki/node.js-example) provided by [chovy](https://github.com/chovy)

##<a name="s3"></a>Amazon AWS S3 Upload
The <a href="https://angular-file-upload.appspot.com/" target="_blank">demo</a> page has an option to upload to S3.
Here is a sample config options:
```
$upload.upload({
        url: $'https://angular-file-upload.s3.amazonaws.com/' //S3 upload url including bucket name,
        method: 'POST',
        data : {
          key: file.name, // the key to store the file on S3, could be file name or customized
          AWSAccessKeyId: <YOUR AWS AccessKey Id>, 
          acl: 'private', // sets the access to the uploaded file in the bucker: private or public 
          policy: $scope.policy, // base64-encoded json policy (see article below)
          signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
          "Content-Type": file.type != '' ? file.type : 'application/octet-stream' // content type of the file (NotEmpty),
          filename: file.name // this is needed for Flash polyfill IE8-9
        },
        file: file,
      });
```
This article explain more about these fields: see [http://aws.amazon.com/articles/1434/](http://aws.amazon.com/articles/1434/)
To generate the policy and signature you need a server side tool as described [this](http://aws.amazon.com/articles/1434/) article.
These two values are generated from the json policy document which looks like this:
```
{"expiration": "2020-01-01T00:00:00Z",
"conditions": [ 
  {"bucket": "angular-file-upload"}, 
  ["starts-with", "$key", ""],
  {"acl": "private"},
  ["starts-with", "$Content-Type", ""],
  ["starts-with", "$filename", ""],
  ["content-length-range", 0, 524288000]
]
}
```
The [demo](https://angular-file-upload.appspot.com/) page provide a helper tool to generate the policy and signature from you from the json policy document. **Note**: Please use https protocol to access demo page if you are using this tool to genenrate signature and policy to protect your aws secret key which should never be shared.

Make sure that you provide upload and CORS post to your bucket at AWS -> S3 -> bucket name -> Properties -> Edit bucket policy and Edit COORS Configuration. Samples of these two files:
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "UploadFile",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::xxxx:user/xxx"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::angular-file-upload/*"
    },
    {
      "Sid": "crossdomainAccess",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::angular-file-upload/crossdomain.xml"
    }
  ]
}
```
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>http://angular-file-upload.appspot.com</AllowedOrigin>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```

For IE8-9 flash polyfill you need to have a <a href='#crossdomain'>crossdomain.xml</a> file at the root of you S3 bucket. Make sure the content-type of crossdomain.xml is text/xml and you provide read access to this file in your bucket policy.


If you have Node.js and aws-sdk stack there is a separate github created by [nukulb](https://github.com/nukulb) as an example using this plugin here: [https://github.com/hubba/s3-angular-file-upload](https://github.com/hubba/s3-angular-file-upload)


##<a name="install"></a> Install

Download latest release from [here](https://github.com/danialfarid/angular-file-upload-bower/releases) or if you are using bower
```sh
#notice 'ng' at the beginning of the module name not 'angular'
bower install ng-file-upload 
```
Make sure to load the scripts in your html file exactly in this order as described in the Usage: 
```html
<script src="angular-file-upload-shim(.min).js"></script> 
<script src="angular(.min).js"></script>
<script src="angular-file-upload(.min).js"></script> 
```

Or for yeoman with bower automatic include:
```
bower install ng-file-upload -save
bower install ng-file-upload-shim -save
```
bower.json
```
{
  "dependencies": [..., "ng-file-upload-shim", "angularjs", "ng-file-upload", ...],
}
```

Package is also available on NuGet: http://www.nuget.org/packages/angular-file-upload with the help of [Georgios Diamantopoulos](https://github.com/georgiosd)

##<a name="contrib"></a> Issues & Contribution

For questions, bug reports, and feature request please search through existing [issue](https://github.com/danialfarid/angular-file-upload/issues) and if you don't find and answer open a new one  [here](https://github.com/danialfarid/angular-file-upload/issues/new). If you need support send me an [email](danial.farid@gmail.com) to set up a session through [HackHands](https://hackhands.com/). You can also contact [me](https://github.com/danialfarid) for any non public concerns.




