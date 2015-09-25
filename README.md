[![npm version](https://badge.fury.io/js/ng-file-upload.svg)](http://badge.fury.io/js/ng-file-upload)
[![Downloads](http://img.shields.io/npm/dm/ng-file-upload.svg)](https://npmjs.org/package/ng-file-upload)
[![Issue Stats](http://issuestats.com/github/danialfarid/ng-file-upload/badge/pr)](http://issuestats.com/github/danialfarid/ng-file-upload)
[![Issue Stats](http://issuestats.com/github/danialfarid/ng-file-upload/badge/issue)](http://issuestats.com/github/danialfarid/ng-file-upload)
[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=danial%2efarid%40gmail%2ecom&lc=CA&item_name=ng%2dfile%2dupload&item_number=ng%2dfile%2dupload&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
<!--[![Gratipay donate button](https://img.shields.io/gratipay/danialfarid.svg?style=social&label=Donate)](http://img.shields.io/gratipay/danialfarid)-->

ng-file-upload
===================

Lightweight Angular directive to upload files.

**See the <a href="https://angular-file-upload.appspot.com/" target="_blank">DEMO</a> page**.<br/>

**Migration notes**: [version 3.0.x](https://github.com/danialfarid/ng-file-upload/releases/tag/3.0.0) [version 3.1.x](https://github.com/danialfarid/ng-file-upload/releases/tag/3.1.0) [version 3.2.x](https://github.com/danialfarid/ng-file-upload/releases/tag/3.2.3) [version 4.x.x](https://github.com/danialfarid/ng-file-upload/releases/tag/4.0.0) [version 5.x.x](https://github.com/danialfarid/ng-file-upload/releases/tag/5.0.0) [version 6.x.x](https://github.com/danialfarid/ng-file-upload/releases/tag/6.0.0) [version 6.2.x](https://github.com/danialfarid/ng-file-upload/releases/tag/6.2.0) [version 7.0.x](https://github.com/danialfarid/ng-file-upload/releases/tag/7.0.0) [version 7.2.x](https://github.com/danialfarid/ng-file-upload/releases/tag/7.2.0)


Ask questions on [StackOverflow](http://stackoverflow.com/) under the [ng-file-upload](http://stackoverflow.com/tags/ng-file-upload/) tag.<br/>
For bug report or feature request please search through existing [issues](https://github.com/danialfarid/ng-file-upload/issues) first then open a new one  [here](https://github.com/danialfarid/ng-file-upload/issues/new). For faster response provide steps to reprodce/versions with a jsfiddle from [here](http://jsfiddle.net/ew4jakn5/). Need paid support contact [me](mailto:danial.farid@gmail.com).<br/>
Contributions are always welcome. If you like this plugin give it a thumbs up at [ngmodules](http://ngmodules.org/modules/ng-file-upload).


Table of Content:
* [Features](#features)
* [Install](#install) ([Manual](#manual), [Bower](#bower), [NuGet](#nuget), [NPM](#npm))
* [Usage](#usage)
* [Old Browsers](#old_browsers)
* [Server Side](#server)
  * [Samples](#server) ([Java](#java), [Spring](#spring), [Node.js](#node), [Rails](#rails), [PHP](#php), [.Net](#net))
  * [CORS](#cors)
  * [Amazon S3 Upload](#s3)

##<a name="features"></a> Features
* file upload progress, cancel/abort
* file drag and drop and paste images (html5 only)
* resumable uploads: pause/resume upload (html5 only) 
* image resize (html5 only)
* validation on file type/size, image width/height, video/audio duration and `ng-required` support.
* show thumbnail or preview of selected images/audio/videos
* supports CORS and direct upload of file's binary data using `Upload.$http()`
* plenty of sample server side code, available on nuget
* on demand flash [FileAPI](https://github.com/mailru/FileAPI) shim loading no extra load for html5 browsers.
* HTML5 FileReader shim for IE8-9

##<a name="install"></a> Install

* <a name="manual"></a>**Manual**: download latest from [here](https://github.com/danialfarid/ng-file-upload-bower/releases/latest)
* <a name="bower"></a>**Bower**:
  * `bower install ng-file-upload-shim --save`(for non html5 suppport)
  * `bower install ng-file-upload --save`
* <a name="nuget"></a>**NuGet**: `PM> Install-Package angular-file-upload` (thanks to [Georgios Diamantopoulos](https://github.com/georgiosd))
* <a name="npm"></a>**NPM**: `npm install ng-file-upload`
```html
<script src="angular(.min).js"></script>
<script src="ng-file-upload-shim(.min).js"></script> <!-- for no html5 browsers support -->
<script src="ng-file-upload(.min).js"></script>
```

##<a name="usage"></a> Usage

###Samples:
* Upload with form submit and validations: [http://jsfiddle.net/danialfarid/maqbzv15/](http://jsfiddle.net/danialfarid/maqbzv15/)
* Upload multiple files on file select:
[http://jsfiddle.net/danialfarid/2vq88rfs/17/](http://jsfiddle.net/danialfarid/2vq88rfs/17/)
* Upload single file on file select:
[http://jsfiddle.net/danialfarid/0mz6ff9o/13/](http://jsfiddle.net/danialfarid/0mz6ff9o/13/)
* Drop and upload with $watch:
[http://jsfiddle.net/danialfarid/s8kc7wg0/31](http://jsfiddle.net/danialfarid/s8kc7wg0/31)
```html
<script src="angular.min.js"></script>
<!-- shim is needed to support non-HTML5 FormData browsers (IE8-9)-->
<script src="ng-file-upload-shim.min.js"></script>
<script src="ng-file-upload.min.js"></script>

Upload on form submit or button click
<form ng-app="fileUpload" ng-controller="MyCtrl" name="form">
  Single Image with validations
  <div class="button" ngf-select ng-model="file" name="file" ngf-pattern="'image/*'"
    accept="image/*" ngf-max-size="20MB" ngf-min-height="100" 
    ngf-resize="{width: 100, height: 100}">Select</div>
  Multiple files
  <div class="button" ngf-select ng-model="files" ngf-multiple="true">Select</div>
  Drop files: <div ngf-drop ng-model="files" class="drop-box">Drop</div>
  <button type="submit" ng-click="submit()">submit</button>
</form>

Upload right away after file selection:
<div class="button" ngf-select="upload($file)">Upload on file select</div>
<div class="button" ngf-select="uploadFiles($files)" multiple="multiple">Upload on file select</div>
  Drop File:
<div ngf-drop="uploadFiles($files)" class="drop-box"
  ngf-drag-over-class="dragover" ngf-multiple="true" 
  ngf-pattern="'image/*,application/pdf'">Drop Images or PDFs files here</div>
<div ngf-no-file-drop>File Drag/Drop is not supported for this browser</div>

Image thumbnail: <img ngf-thumbnail="file || '/thumb.jpg'">
Audio preview: <audio controls ngf-src="file"></audio>
Video preview: <video controls ngf-src="file"></video>
```
Javascript code:
```js
//inject directives and services.
var app = angular.module('fileUpload', ['ngFileUpload']);

app.controller('MyCtrl', ['$scope', 'Upload', function ($scope, Upload) {
    // upload later on form submit or something similar
    $scope.submit = function() {
      if (form.file.$valid && $scope.file && !$scope.file.$error) {
        $scope.upload($scope.file);
      }
    });

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: 'upload/url',
            fields: {'username': $scope.username},
            file: file
        }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
        }).error(function (data, status, headers, config) {
            console.log('error status: ' + status);
        })
    };
    // for multiple files:
    $scope.upload = function (files) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          Upload.upload({..., file: files[i], ...})...;
        }
        // or send them all together for HTML5 browsers:
        Upload.upload({..., file: files, ...})...;
      }
    }
}]);
```

### Full reference

#### File select and drop

At least one of the `ngf-select` or `ngf-drop` are mandatory for the plugin to link to the element.
`ngf-select` only attributes are marked with * and `ngf-drop` only attributes are marked with +.

```html
<div|button|input type="file"|ngf-select|ngf-drop...
  ngf-select="" or "upload($files, $file, $event)" // called when files are selected or cleared
  ngf-drop="" or "upload($files, $file, $event)" // called when files being dropped
    // You can have ng-model or ngf-change instead of specifying function for ngf-drop and ngf-select
  ng-model="myFiles" // binds the selected/dropped file or files to the scope model
    // could be an array or single file depending on ngf-multiple and ngf-keep values.
  ngf-change="upload($files, $file, $newFiles, $duplicateFiles, $event)"
    // called when files are selected, dropped, or cleared
  ng-disabled="boolean" // disables this element
  ngf-select-disabled="boolean" // default false, disables file select on this element
  ngf-drop-disabled="boolean" // default false, disables file drop on this element
  ngf-multiple="boolean" // default false, allows selecting multiple files
  ngf-keep="boolean" // default false, keep the previous ng-model files and append the new files
    // new files are set as $newFiles argument in ngf-select, ngf-drop, or ngf-change function
  ngf-keep-distinct="boolean" // default false, if ngf-keep is set, removes duplicate selected files
    // duplicate files are set as $duplicateFiles argument in ngf-select, ngf-drop, or ngf-change function
  
  *ngf-capture="'camera'" or "'other'" // allows mobile devices to capture using camera
  *accept="image/*" // standard HTML accept attribute for the browser specific popup window filtering
  
  +ngf-allow-dir="boolean" // default true, allow dropping files only for Chrome webkit browser
  +ngf-drag-over-class="{accept:'acceptClass', reject:'rejectClass', delay:100}" or "myDragOverClass" or
                    "calcDragOverClass($event)"
              // drag over css class behaviour. could be a string, a function returning class name
              // or a json object {accept: 'c1', reject: 'c2', delay:10}. default "dragover".
              // accept/reject class only works in Chrome validating only the file mime type
              // against ngf-pattern
  +ngf-drop-available="dropSupported" // set the value of scope model to true or false based on file
                                     // drag&drop support for this browser
  +ngf-stop-propagation="boolean" // default false, whether to propagate drag/drop events.
  +ngf-hide-on-drop-not-available="boolean" // default false, hides element if file drag&drop is not
  
  ngf-resize="{width: 100, height: 100, quality: .8}" // resizes the image to the given width, height and
              // quality (optional between 0.1 and 1.0)
              
  //validations:
  ngf-pattern="'.pdf,.jpg,video/*'" // comma separated wildcard to filter file names and types allowed
              // validate error name: pattern
  ngf-min-size, ngf-max-size="100" in bytes or "'10KB'" or "'10MB'" or "'10GB'"
              // validate as form.file.$error.maxSize=true and file.$error='maxSize'
  ngf-min-height, ngf-max-height, ngf-min-width, ngf-max-width="1000" in pixels only images
              // validate error name: maxHeight
  ngf-ratio="9x6,1.6" list of comma separated valid aspect ratio of images in float or 3x2 format
              // validate error name: ratio
  ngf-min-duration, ngf-max-duration="100.5" in seconds or "'10s'" or "'10m'" or "'10h'" only audio, video
              // validate error name: maxDuration
  ngf-validate="{size: {min: 10, max: '20MB'}, width: {min: 100, max:10000}, height: {min: 100, max: 300}
                ratio: '2x1', duration: {min: '10s', max: '5m'}, pattern: '.jpg'}"
                shorthand form for above validations in one place.
  ngf-validate-fn="validate($file)" // custom validation function, return boolean or string containing the error.
              // validate error name: validateFn
  ngf-validate-async-fn="validate($file)" // custom validation function, return a promise that resolve to
              // boolean or string containing the error. validate error name: validateAsyncFn
  ngf-validate-force="boolean" // default false, if true file.$erro will be set if the dimension or duration
              // values for validations cannot be calculated for example image load error or unsupported video by browser
  ngf-validate-later="boolean" // default false, if true model will be set and change will be called before validation

>Upload/Drop</div>

<div|... ngf-no-file-drop>File Drag/drop is not supported</div>

```

#### File preview
```html
<img|audio|video|div
  *ngf-src="file" //To preview the selected file, sets src attribute to the file data url.
  *ngf-background="file" //sets background-image style to the file data url.
  ngf-resize="{width: 20, height: 20, quality: 0.9}" // only for image resizes the image before setting it
             // as src or background image. quality is optional.
  ngf-no-object-url="true or false" // see #887 to force base64 url generation instead of object url. Default false
>

<div|span|...
 *ngf-thumbnail="file" //Generates a thumbnail version of the image file
 ngf-size="{width: 20, height: 20, quality: 0.9}" the image will be resized to this size
        // if not specified will be resized to this element`s client width and height.
 ngf-as-background="boolean" //if true it will set the background image style instead of src attribute.
>
```

#### Upload service:
```js
var upload = Upload.upload({
  *url: 'server/upload/url', // upload.php script, node.js route, or servlet url
  *file: file or files or {pic: picFile, 'doc,myDoc.pdf': docFile},  
         // single file or an array of files (html5 only) or 
         // a map of key[,name] -> file (map with more than one entry is for html5 only) 
         // the key is server request file form key param ('Content-Disposition') and 
         // the optional comma-separated name (html5 only) is to chnage the original file name.
         // by default the key is 'file' and original file name is used.
  method: 'POST' or 'PUT'(html5), default POST,
  headers: {'Authorization': 'xxx'}, // only for html5
  /*
  map of extra form data fields to send along with file. each field will be sent as a form field.
  The values are converted to json string or jsob blob or nested form depending on 'sendFieldsAs' option. */
  fields: {key: $scope.myValue, ...},
  /*
  default is 'json', sends each field as json string plain text content type, 'json-blob' sends object fields
  as a blob object with content type 'application/json', 'form' sends fields as nested form fields. see #784 */
  sendFieldsAs: json|json-blob|form,
  /* customize how data is added to the formData. See #40#issuecomment-28612000 for sample code. */
  formDataAppender: function(formData, key, val){},
  /*
  data will be sent as a separate form data field called "data".*/
  data: {}.
  withCredentials: true|false,
  /*
  See resumable upload guide below the code for more details (html5 only) */
  resumeSizeUrl: '/uploaded/size/url?file=' + file.name // uploaded file size so far on the server.
  resumeSizeResponseReader: function(data) {return data.size;} // reads the uploaded file size from resumeSizeUrl GET response
  resumeSize: function() {return promise;} // function that returns a prommise which will be
                                            // resolved to the upload file size on the server.
  resumeChunkSize: 10000 or '10KB' or '10MB' // upload in chunks of specified size
  
  ... and all other angular $http() options could be used here.
}).progress(function(evt) {
  console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
}).success(function(data, status, headers, config) {
  // file is uploaded successfully
  console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
}).error(function(data, status, headers, config) {
  // handle error
}).xhr(function(xhr){
  //access or attach event listeners to the underlying XMLHttpRequest
  xhr.upload.addEventListener(...)
});
/* return $http promise then,catch or finally.
Note that this promise does NOT have progress, abort or xhr functions */
var promise = upload.then(success, error, progress);
              upload.catch(errorCallback);
              upload.finally(callback, notifyCallback);

/* cancel/abort the upload in progress. */
upload.abort();

/* alternative way of uploading, send the file binary with the file's content-type.
   Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
   It could also be used to enable progress for regualr angular $http() post/put requests.
*/
Upload.http({
  url: '/server/upload/url',
  headers : {
    'Content-Type': file.type
  },
  data: file
})

/* Set the default values for ngf-select and ngf-drop directives*/
Upload.setDefaults({ngfMinSize: 20000, ngfMaxSize:20000000, ...})

/* Convert the file to base64 data url*/
Upload.dataUrl(file, disallowObjectUrl).then(function(url){...});

/* Get image file dimensions*/
Upload.imageDimensions(file).then(function(dimensions){console.log(dimensions.widht, dimensions.height);});

/* Get audio/video duration*/
Upload.mediaDuration(file).then(function(durationInSeconds){...});

/* returns boolean showing if image resize is supported by this browser*/
Upload.isResizeSupported()
/* returns boolean showing if resumable upload is supported by this browser*/
Upload.isResumeSupported()
```
**ng-model**
The model value will be a single file instead of an array if all of the followings are true:
  * `ngf-multiple` is not set or is resolved to false.
  * `multiple` attribute is not set on the element
  * `ngf-keep` is not set or is resolved to false.

**validation**
When any of the validation directives specified the form validation will take place and
you can access the value of the validation using `myForm.myFileInputName.$error.<validate error name>`
for example `form.file.$error.pattern`.
If multiple file selection is allowed you can find the error of each individual file
with `file.$error` and description of it `file.$errorParam`.
So before uploading you can check if the file is valid by `!file.$error`.

**Upload multiple files**: Only for HTML5 FormData browsers (not IE8-9) if you pass an array of files to `file` option it will upload all of them together in one request. In this case the `fileFormDataName` could be an array of names or a single string. For Rails or depending on your server append square brackets to the end (i.e. `file[]`).
Non-html5 browsers due to flash limitation will still upload array of files one by one in a separate request. You should iterate over files and send them one by one if you want cross browser solution.

**Upload.http()**:
This is equivalent to angular $http() but allow you to listen to the progress event for HTML5 browsers.

**drag and drop styling**: For file drag and drop, `ngf-drag-over-class` could be used to style the drop zone. It can be a function that returns a class name based on the $event. Default is "dragover" string.
Only in chrome It could be a json object `{accept: 'a', 'reject': 'r', delay: 10}` that specify the class name for the accepted or rejected drag overs. The validation `ngf-pattern` could only check the file type since that is the only property of the file that is reported by the browser on drag. So you cannot validate the file size or name on drag. There is also some limitation on some file types which are not reported by Chrome.
`delay` param is there to fix css3 transition issues from dragging over/out/over [#277](https://github.com/danialfarid/angular-file-upload/issues/277).

**Upload.setDefaults()**:
If you have many file selects or drops you can set the default values for the directives by calling `Upload.setDefaults(options)`. `options` would be a json object with directive names in camelcase and their default values.

**Resumable Uploads**
The plugin supports resumable uploads for large files. 
On your server you need to keep track of what files are being uploaded and how much of the file is uploaded.
 * `url` upload endpoint need to reassemble the file chunks by appending uploading content to the end of the file or correct chunk position if it already exists.
 * `resumeSizeUrl` server endpoint to return uploaded file size so far on the server to be able to resume the upload from 
 where it is ended. It should return zero if the file has not been uploaded yet. <br/>A GET request will be made to that 
 url for each upload to determine if part of the file is already uploaded or not. You need a unique way of identifying the file
  on the server so you can pass the file name or generated id for the file as a request parameter.<br/>
 By default it will assume that the response 
 content is an integer or a json object with `size` integer property. If you return other formats from the endpoint you can specify 
 `resumeSizeResponseReader` function to return the size value from the response. Alternatively instead of `resumeSizeUrl` you can use 
 `resumeSize` function which returns a promise that resolves to the size of the uploaded file so far.
 Make sure when the file is fully uploaded without any error/abort this endpoint returns zero for the file size 
 if you want to let the user to upload the same file again. Or optionally you could have a restart endpoint to 
 set that back to zero to allow re-uploading the same file.
 * Optionally you can specify `resumeChunkSize` to upload the file in chunks to the server. This will allow uploading to GAE or other servers that have 
 file size limitation and trying to upload the whole request before passing it for internal processing.<br/>
 If this option is set the requests will have three extra fields: 
 `chunckSize`, `chunkNumber` (zero starting), and `totalSize` to help the server to write the uploaded chunk to 
 the correct position.
 Uploading in chunks could slow down the overall upload time specially if the chunk size is too small.
 



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
* Custom headers will not work due to a Flash limitation [#111](https://github.com/danialfarid/ng-file-upload/issues/111) [#224](https://github.com/danialfarid/ng-file-upload/issues/224) [#129](https://github.com/danialfarid/ng-file-upload/issues/129)
* Due to Flash bug [#92](https://github.com/danialfarid/ng-file-upload/issues/92) Server HTTP error code 400 will be returned as 200 to the client. So avoid returning 400 on your server side for upload response otherwise it will be treated as a success response on the client side.
* In case of an error response (http code >= 400) the custom error message returned from the server may not be available. For some error codes flash just provide a generic error message and ignores the response text. [#310](https://github.com/danialfarid/ng-file-upload/issues/310)
* Older browsers won't allow `PUT` requests. [#261](https://github.com/danialfarid/ng-file-upload/issues/261)

##<a name="server"></a>Server Side

* <a name="java"></a>**Java**
You can find the sample server code in Java/GAE [here](https://github.com/danialfarid/ng-file-upload/blob/master/demo/src/main/java/com/df/angularfileupload/)
* <a name="spring"></a>**Spring MVC**
[Wiki Sample](https://github.com/danialfarid/ng-file-upload/wiki/spring-mvc-example) provided by [zouroto](https://github.com/zouroto)
* <a name="node"></a>**Node.js**
[Wiki Sample](https://github.com/danialfarid/ng-file-upload/wiki/node.js-example) provided by [chovy](https://github.com/chovy).
[Another wiki](https://github.com/danialfarid/ng-file-upload/wiki/Node-example) using Express 4.0 and the Multiparty provided by [Jonathan White](https://github.com/JonathanZWhite)
* <a name="rails"></a>**Rails**
  * [Wiki Sample](https://github.com/danialfarid/ng-file-upload/wiki/Rails-Example) provided by [guptapriyank](https://github.com/guptapriyank).
  * [Blog post](http://www.coshx.com/blog/2015/07/10/file-attachments-in-angular/)
provided by [Coshx Labs](http://www.coshx.com/).
  * **Rails progress event**: If your server is Rails and Apache you may need to modify server configurations for the server to support upload progress. See [#207](https://github.com/danialfarid/ng-file-upload/issues/207)
* <a name="php"></a>**PHP**
[Wiki Sample] (https://github.com/danialfarid/ng-file-upload/wiki/PHP-Example) and related issue [only one file in $_FILES when uploading multiple files] (https://github.com/danialfarid/ng-file-upload/issues/475)
* <a name="net"></a>**.Net**
Sample client and server code [demo/C#] (https://github.com/danialfarid/ng-file-upload/tree/master/demo/C%23) provided by [AtomStar](https://github.com/AtomStar)

##<a name="cors"></a>CORS
To support CORS upload your server needs to allow cross domain requests. You can achive that by having a filter or interceptor on your upload file server to add CORS headers to the response similar to this:
([sample java code](https://github.com/danialfarid/ng-file-upload/blob/master/demo/src/com/df/angularfileupload/CORSFilter.java))
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

#### <a name="s3"></a>Amazon AWS S3 Upload
The <a href="https://angular-file-upload.appspot.com/" target="_blank">demo</a> page has an option to upload to S3.
Here is a sample config options:
```
Upload.upload({
        url: 'https://angular-file-upload.s3.amazonaws.com/', //S3 upload url including bucket name
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
[This article](http://aws.amazon.com/articles/1434/) explains more about these fields and provides instructions on how to generate the policy and signature using a server side tool.
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
The [demo](https://angular-file-upload.appspot.com/) page provide a helper tool to generate the policy and signature from you from the json policy document. **Note**: Please use https protocol to access demo page if you are using this tool to generate signature and policy to protect your aws secret key which should never be shared.

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


You can also have a look at [https://github.com/nukulb/s3-angular-file-upload](https://github.com/nukulb/s3-angular-file-upload) for another example with [this](https://github.com/danialfarid/ng-file-upload/issues/814#issuecomment-112198426) fix.




