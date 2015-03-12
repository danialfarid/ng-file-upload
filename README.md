angular-file-upload
===================

Lightweight Angular JS directive to upload files.<br/><br/>**Here is the <a href="https://angular-file-upload.appspot.com/" target="_blank">DEMO</a> page**.<br/> To help development of this module give it a thumbs up at [ngmodules](http://ngmodules.org/modules/angular-file-upload) or get me a <a target="_blank" href="https://angular-file-upload.appspot.com/donate.html">cup of tea <img src="https://angular-file-upload.appspot.com/img/tea.png" width="40" height="24" title="Icon made by Freepik.com"></a>.

**Migration notes**: [version 3.0.0](https://github.com/danialfarid/angular-file-upload/releases/tag/3.0.0) [version 3.1.0](https://github.com/danialfarid/angular-file-upload/releases/tag/3.1.0) [version 3.2.0](https://github.com/danialfarid/angular-file-upload/releases/tag/3.2.3)

Table of Content:
* [Features](#features)
* [Usage](#usage)
* [Old Browsers](#old_browsers)
* [Server Side](#server) 
  * [Samples](#server) ([Java](#java), [Spring](#spring), [Node.js](#node), [Rails](#rails), [PHP](#php), [.Net](#net))
  * [Amazon S3 Upload](#s3)
  * [CORS](#cors)
* [Install](#install) ([Manual](#manual), [Bower](#bower), [Yeoman](#yeoman), [NuGet](#nuget), [npm](#npm))
* [Questions, Issues and Contribution](#contrib)

##<a name="features"></a> Features
* Supports upload progress, cancel/abort upload while in progress, File drag and drop (html5), Directory drag and drop (webkit), CORS, `PUT(html5)`/`POST` methods.
* Cross browser file upload (`HTML5` and `non-HTML5`) with Flash polyfill [FileAPI](https://github.com/mailru/FileAPI). Allows client side validation/modification before uploading the file
* Direct upload to db services CouchDB, imgur, etc... with file's content type using `$upload.http()`. This enables progress event for angular http `POST`/`PUT` requests. See [#88(comment)](https://github.com/danialfarid/angular-file-upload/issues/88#issuecomment-31366487) for discussion and usage.
* Seperate shim file, FileAPI files are loaded on demand for `non-HTML5` code meaning no extra load/code if you just need HTML5 support.
* Lightweight using regular `$http` to upload (with shim for non-HTML5 browsers) so all angular `$http` features are available

##<a name="usage"></a> Usage

###Sample:
[jsfiddle http://jsfiddle.net/nmdcwf3w/](http://jsfiddle.net/nmdcwf3w/)
```html
<script src="angular.min.js"></script>
<!-- shim is needed to support non-HTML5 FormData browsers (IE8-9)-->
<script src="angular-file-upload-shim.min.js"></script> 
<script src="angular-file-upload.min.js"></script> 

<div ng-app="fileUpload" ng-controller="MyCtrl">
    watching model:
    <div class="button" ng-file-select ng-model="files">Upload using model $watch</div>
    <div class="button" ng-file-select ng-file-change="upload($files)">Upload on file change</div>
    Drop File:
    <div ng-file-drop ng-model="files" class="drop-box" 
        drag-over-class="dragover" ng-multiple="true" allow-dir="true"
        accept=".jpg,.png,.pdf">Drop Images or PDFs files here</div>
    <div ng-no-file-drop>File Drag/Drop is not supported for this browser</div>
</div>
```
JS:
```js
//inject angular file upload directives and services.
var app = angular.module('fileUpload', ['angularFileUpload']);

app.controller('MyCtrl', ['$scope', '$upload', function ($scope, $upload) {
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $upload.upload({
                    url: 'upload/url',
                    fields: {'username': $scope.username},
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                });
            }
        }
    };
}]);
```

### Full reference

#### File select

```html
<button|div|input type="file"|ng-file-select|...
    ng-file-select ng-model="myFiles" // binds the selected files to the scope model
    ng-file-change="fileSelected($files, $event)" // will be called upon files being selected
                                                  // you can use $scope.$watch('myFiles') instead
    ng-multiple="true|false" // default false, allows selecting multiple files
    ng-capture="'camera'|'other'" // allows mobile devices to capture using camera
    accept="'image/*'" // see standard HTML file input accept attribute
    ng-accept="'image/*'|validate($file)" // function or comma separated wildcard to filter files allowed
    ng-model-rejected="rejFiles" // bind to dropped files that do not match the accept wildcard
>Upload</button>
```
#### File drop
```html
<div|button|ng-file-drop|...
    ng-file-drop ng-model="myFiles" // binds the dropped files to the scope model
    ng-file-change="fileDropped($files, $event, $rejectedFiles)" //called upon files being dropped
    ng-multiple="true|false" // default false, allows selecting multiple files. 
    ng-accept="'.pdf,.jpg'|validate($file)" // function or comma separated wildcard to filter files allowed
    ng-model-rejected="rejFiles" // bind to dropped files that do not match the accept wildcard
    allow-dir="true|false" // default true, allow dropping files only for Chrome webkit browser
    drag-over-class="{accept:'acceptClass', reject:'rejectClass', delay:100}|myDragOverClass|
                    calcDragOverClass($event)" 
              // drag over css class behaviour. could be a string, a function returning class name 
              // or a json object {accept: 'c1', reject: 'c2', delay:10}. default "dragover"
              // reject class only works in Chrome.
    drop-available="dropSupported" // set the value of scope model to true or false based on file
                                  // drag&drop support for this browser
    stop-propagation="true|false" // default false, whether to propagate drag/drop events.
    hide-on-drop-not-available="true|false" // default false, hides element if file drag&drop is not supported
>
Drop files here
</div>
<div|... ng-no-file-drop>File Drag/drop is not supported</div>
```

#### $upload service:
```js
var upload = $upload.upload({
  *url: 'server/upload/url', // upload.php script, node.js route, or servlet url
  *file: file,  // single file or an array of files (array is for html5 only)
  method: 'POST' or 'PUT', default POST,
  headers: {'Authorization': 'xxx'}, // only for html5
  fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...], // to modify the name of the file(s)
  /* 
  file formData name ('Content-Disposition'), server side request form name could be
  an array  of names for multiple files (html5). Default is 'file' */
  fileFormDataName: 'myFile' or ['file[0]', 'file[1]', ...], 
  /* 
  map of extra form data fields to send along with file. each field will be sent as a form field.
  The values are converted to json string or jsob blob depending on 'sendObjectsAsJsonBlob' option. */
  fields: {key: $scope.myValue, ...},
  /*
  if the value of a form field is an object it will be sent as 'application/json' blob 
  rather than json string, default false. */
  sendObjectsAsJsonBlob: true|false,
  /* customize how data is added to the formData. See #40#issuecomment-28612000 for sample code. */
  formDataAppender: function(formData, key, val){},
  /*
  data will be sent as a separate form data field called "data". It will be converted to json string 
  or jsob blob depending on 'sendObjectsAsJsonBlob' option*/
  data: {}. 
  withCredentials: true|false,
  ... and all other angular $http() options could be used here.
}).progress(function(evt) {
  console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
}).success(function(data, status, headers, config) {
  // file is uploaded successfully
  console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
}).error(...
/* access or attach event listeners to the underlying XMLHttpRequest */
}).xhr(function(xhr){xhr.upload.addEventListener(...) 
/* return $http promise then(). Note that this promise does NOT have progress/abort/xhr functions */
});
/* then promise (note that returned promise doesn't have progress, xhr and cancel functions. */
var promise = upload.then(success, error, progress);

/* cancel/abort the upload in progress. */
upload.abort();

/* alternative way of uploading, send the file binary with the file's content-type.
   Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
   It could also be used to monitor the progress of a normal http post/put request. 
   Note that the whole file will be loaded in browser first so large files could crash the browser.
   You should verify the file size before uploading with $upload.http().
*/
$upload.http({...})  // See 88#issuecomment-31366487 for sample code.
```

**Upload multiple files**: Only for HTML5 FormData browsers (not IE8-9) if you pass an array of files to `file` option it will upload all of them together in one request. In this case the `fileFormDataName` could be an array of names or a single string. For Rails or depending on your server append square brackets to the end (i.e. `file[]`). 
Non-html5 browsers due to flash limitation will still upload array of files one by one in a separate request. You should iterate over files and send them one by one if you want cross browser solution.

**$upload.http()**: You can also use `$upload.http()` to send the file binary or any data to the server while being able to listen to progress event. See [#88](https://github.com/danialfarid/angular-file-upload/issues/88) for more details.
This is equivalent to angular $http() but allow you to listen to progress event for HTML5 browsers.

**Rails progress event**: If your server is Rails and Apache you may need to modify server configurations for the server to support upload progress. See [#207](https://github.com/danialfarid/angular-file-upload/issues/207)

**drag and drop styling**: For file drag and drop, `drag-over-class` could be used to style the drop zone. It can be a function that returns a class name based on the $event. Default is "dragover" string.
It could also be a json object `{accept: 'a', 'reject': 'r', delay: 10}` that specify the class name for the accepted or rejected drag overs. 
`reject` param will only work in Chrome browser which provide information about dragged over content. However some file types are reported as empty by Chrome even though they will have correct type when they are dropped, so if your `accept` attribute wildcard depends on file types rather than file extensions it may not work for those files if their type is not reported by Chrome. 
`delay` param is there to fix css3 transition issues from dragging over/out/over [#277](https://github.com/danialfarid/angular-file-upload/issues/277).

##<a name="old_browsers"></a> Old browsers

For browsers not supporting HTML5 FormData (IE8, IE9, ...) [FileAPI](https://github.com/mailru/FileAPI) module is used. 
**Note**: You need Flash installed on your browser since `FileAPI` uses Flash to upload files.

These two files  **`FileAPI.min.js`, `FileAPI.flash.swf`** will be loaded by the module on demand (no need to be included in the html) if the browser does not supports HTML5 FormData to avoid extra load for HTML5 browsers.
You can place these two files beside `angular-file-upload-shim(.min).js` on your server to be loaded automatically from the same path or you can specify the path to those files if they are in a different path using the following script:
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
        //noContentTimeout: 10000 (see #528)
    }
</script>
<script src="angular-file-upload-shim.min.js"></script>...
```
**Old browsers known issues**: 
* Because of a Flash limitation/bug if the server doesn't send any response body the status code of the response will be always `204 'No Content'`. So if you have access to your server upload code at least return a character in the response for the status code to work properly.
* Custom headers will not work due to a Flash limitation [#111](https://github.com/danialfarid/angular-file-upload/issues/111) [#224](https://github.com/danialfarid/angular-file-upload/issues/224) [#129](https://github.com/danialfarid/angular-file-upload/issues/129)
* Due to Flash bug [#92](https://github.com/danialfarid/angular-file-upload/issues/92) Server HTTP error code 400 will be returned as 200 to the client. So avoid returning 400 on your server side for upload response otherwise it will be treated as a success response on the client side.
* In case of an error response (http code >= 400) the custom error message returned from the server may not be available. For some error codes flash just provide a generic error message and ignores the response text. [#310](https://github.com/danialfarid/angular-file-upload/issues/310)
* Older browsers won't allow `PUT` requests. [#261](https://github.com/danialfarid/angular-file-upload/issues/261)

##<a name="server"></a>Server Side

* <a name="java"></a>**Java**
You can find the sample server code in Java/GAE [here](https://github.com/danialfarid/angular-file-upload/blob/master/demo/src/com/df/angularfileupload/)
* <a name="spring"></a>**Spring MVC**
[Wiki Sample](https://github.com/danialfarid/angular-file-upload/wiki/spring-mvc-example) provided by [zouroto](https://github.com/zouroto)
* <a name="node"></a>**Node.js** 
[Wiki Sample](https://github.com/danialfarid/angular-file-upload/wiki/node.js-example) provided by [chovy](https://github.com/chovy).
[Another wiki](https://github.com/danialfarid/angular-file-upload/wiki/Node-example) using Express 4.0 and the Multiparty provided by [Jonathan White](https://github.com/JonathanZWhite)
* <a name="rails"></a>**Rails**
[Wiki Sample](https://github.com/danialfarid/angular-file-upload/wiki/Rails-Example) provided by [guptapriyank](https://github.com/guptapriyank)
**Rails progress event**: If your server is Rails and Apache you may need to modify server configurations for the server to support upload progress. See [#207](https://github.com/danialfarid/angular-file-upload/issues/207)
* <a name="php"></a>**PHP**
[Wiki Sample] (https://github.com/danialfarid/angular-file-upload/wiki/PHP-Example) and related issue [only one file in $_FILES when uploading multiple files] (https://github.com/danialfarid/angular-file-upload/issues/475)
* <a name="net"></a>**.Net**
Sample client and server code [demo/C#] (https://github.com/danialfarid/angular-file-upload/tree/master/demo/C%23) provided by [AtomStar](https://github.com/AtomStar)

#### <a name="s3"></a>Amazon AWS S3 Upload
The <a href="https://angular-file-upload.appspot.com/" target="_blank">demo</a> page has an option to upload to S3.
Here is a sample config options:
```
$upload.upload({
        url: $'https://angular-file-upload.s3.amazonaws.com/', //S3 upload url including bucket name
        method: 'POST',
        fields : {
          key: file.name, // the key to store the file on S3, could be file name or customized
          AWSAccessKeyId: <YOUR AWS AccessKey Id>, 
          acl: 'private', // sets the access to the uploaded file in the bucket: private or public 
          policy: $scope.policy, // base64-encoded json policy (see article below)
          signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
          "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
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

Make sure that you provide upload and CORS post to your bucket at AWS -> S3 -> bucket name -> Properties -> Edit bucket policy and Edit CORS Configuration. Samples of these two files:
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


If you have Node.js there is a separate github project created by [Nukul Bhasin](https://github.com/nukulb) as an example using this plugin here: [https://github.com/nukulb/s3-angular-file-upload](https://github.com/nukulb/s3-angular-file-upload)

##<a name="cors"></a>CORS
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


##<a name="install"></a> Install

####<a name="manual"></a> Manual download 
Download latest release from [here](https://github.com/danialfarid/angular-file-upload-bower/releases)

####<a name="bower"></a> Bower
```sh
#notice 'ng' at the beginning of the module name not 'angular'
bower install ng-file-upload 
```
```html
<script src="angular(.min).js"></script>
<script src="angular-file-upload-shim(.min).js"></script> <!-- for no html5 browsers support -->
<script src="angular-file-upload(.min).js"></script> 
```

####<a name="yeoman"></a> Yeoman with bower automatic include
```
bower install ng-file-upload --save
bower install ng-file-upload-shim --save 
```
bower.json
```
{
  "dependencies": [..., "ng-file-upload-shim", "ng-file-upload", ...],
}
```
####<a name="nuget"></a> NuGet
Package is also available on NuGet: http://www.nuget.org/packages/angular-file-upload with the help of [Georgios Diamantopoulos](https://github.com/georgiosd)

####<a name="npm"></a> NPM
```
npm install ng-file-upload
```

##<a name="contrib"></a> Issues & Contribution

For questions, bug reports, and feature request please search through existing [issue](https://github.com/danialfarid/angular-file-upload/issues) and if you don't find and answer open a new one  [here](https://github.com/danialfarid/angular-file-upload/issues/new). If you need support send me an [email](danial.farid@gmail.com) to set up a session through [HackHands](https://hackhands.com/). You can also contact [me](https://github.com/danialfarid) for any non public concerns.




