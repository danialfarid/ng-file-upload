'use strict';


var app = angular.module('fileUpload', ['ngFileUpload']);
var version = '9.1.0';

app.controller('MyCtrl', ['$scope', '$http', '$timeout', '$compile', 'Upload', function ($scope, $http, $timeout, $compile, Upload) {
  $scope.usingFlash = FileAPI && FileAPI.upload != null;
  //Upload.setDefaults({ngfKeep: true, ngfPattern:'image/*'});
  $scope.changeAngularVersion = function () {
    window.location.hash = $scope.angularVersion;
    window.location.reload(true);
  };
  $scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ?
    window.location.hash.substring(2) : window.location.hash.substring(1)) : '1.2.24';

  $scope.invalidFiles = [];

  $scope.$watch('files', function (files) {
    $scope.formUpload = false;
    if (files != null) {
      if (!angular.isArray(files)) {
        $timeout(function () {
          $scope.files = files = [files];
        });
        return;
      }
      for (var i = 0; i < files.length; i++) {
        $scope.errorMsg = null;
        (function (f) {
          $scope.upload(f, true);
        })(files[i]);
      }
    }
  });

  $scope.uploadPic = function (file) {
    $scope.formUpload = true;
    if (file != null) {
      $scope.upload(file)
    }
  };

  $scope.upload = function(file, resumable) {
    $scope.errorMsg = null;
    if ($scope.howToSend === 1) {
      uploadUsingUpload(file, resumable);
    } else if ($scope.howToSend == 2) {
      uploadUsing$http(file);
    } else {
      uploadS3(file);
    }
  };

  $scope.isResumeSupported = Upload.isResumeSupported();

  $scope.restart = function(file) {
    if (Upload.isResumeSupported()) {
      $http.get('https://angular-file-upload-cors-srv.appspot.com/upload?restart=true&name=' + encodeURIComponent(file.name)).then(function () {
        $scope.upload(file, true);
      });
    } else {
      $scope.upload(file);
    }
  };

  $scope.chunkSize = 100000;
  function uploadUsingUpload(file, resumable) {
    file.upload = Upload.upload({
      url: 'https://angular-file-upload-cors-srv.appspot.com/upload' + $scope.getReqParams(),
      resumeSizeUrl: resumable ? 'https://angular-file-upload-cors-srv.appspot.com/upload?name=' + encodeURIComponent(file.name) : null,
      resumeChunkSize: resumable ? $scope.chunkSize : null,
      headers: {
        'optional-header': 'header-value'
      },
      data: {username: $scope.username, file: file}
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });

    file.upload.xhr(function (xhr) {
      // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
    });
  }

  function uploadUsing$http(file) {
    file.upload = Upload.http({
      url: 'https://angular-file-upload-cors-srv.appspot.com/upload' + $scope.getReqParams(),
      method: 'POST',
      headers: {
        'Content-Type': file.type
      },
      data: file
    });

    file.upload.then(function (response) {
      file.result = response.data;
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    });

    file.upload.progress(function (evt) {
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  }

  function uploadS3(file) {
    file.upload = Upload.upload({
      url: $scope.s3url,
      method: 'POST',
      data: {
        key: file.name,
        AWSAccessKeyId: $scope.AWSAccessKeyId,
        acl: $scope.acl,
        policy: $scope.policy,
        signature: $scope.signature,
        'Content-Type': file.type === null || file.type === '' ? 'application/octet-stream' : file.type,
        filename: file.name,
        file: file
      }
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
      });
    }, function (response) {
      if (response.status > 0)
        $scope.errorMsg = response.status + ': ' + response.data;
    });

    file.upload.progress(function (evt) {
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
    storeS3UploadConfigInLocalStore();
  }

  $scope.generateSignature = function () {
    $http.post('/s3sign?aws-secret-key=' + encodeURIComponent($scope.AWSSecretKey), $scope.jsonPolicy).
      success(function (data) {
        $scope.policy = data.policy;
        $scope.signature = data.signature;
      });
  };

  if (localStorage) {
    $scope.s3url = localStorage.getItem('s3url');
    $scope.AWSAccessKeyId = localStorage.getItem('AWSAccessKeyId');
    $scope.acl = localStorage.getItem('acl');
    $scope.success_action_redirect = localStorage.getItem('success_action_redirect');
    $scope.policy = localStorage.getItem('policy');
    $scope.signature = localStorage.getItem('signature');
  }

  $scope.success_action_redirect = $scope.success_action_redirect || window.location.protocol + '//' + window.location.host;
  $scope.jsonPolicy = $scope.jsonPolicy || '{\n  "expiration": "2020-01-01T00:00:00Z",\n  "conditions": [\n    {"bucket": "angular-file-upload"},\n    ["starts-with", "$key", ""],\n    {"acl": "private"},\n    ["starts-with", "$Content-Type", ""],\n    ["starts-with", "$filename", ""],\n    ["content-length-range", 0, 524288000]\n  ]\n}';
  $scope.acl = $scope.acl || 'private';

  function storeS3UploadConfigInLocalStore() {
    if ($scope.howToSend === 3 && localStorage) {
      localStorage.setItem('s3url', $scope.s3url);
      localStorage.setItem('AWSAccessKeyId', $scope.AWSAccessKeyId);
      localStorage.setItem('acl', $scope.acl);
      localStorage.setItem('success_action_redirect', $scope.success_action_redirect);
      localStorage.setItem('policy', $scope.policy);
      localStorage.setItem('signature', $scope.signature);
    }
  }

  (function handleDynamicEditingOfScriptsAndHtml($scope) {
    $scope.defaultHtml = document.getElementById('editArea').innerHTML.replace(/\t\t\t\t/g, '').replace(/&amp;/g, '&');

    var fromLocal = (localStorage && localStorage.getItem('editHtml' + version));
    $scope.editHtml = fromLocal || $scope.defaultHtml;
    function htmlEdit() {
      document.getElementById('editArea').innerHTML = $scope.editHtml;
      $compile(document.getElementById('editArea'))($scope);
      $scope.editHtml && localStorage && localStorage.setItem('editHtml' + version, $scope.editHtml);
      if ($scope.editHtml != $scope.htmlEditor.getValue()) $scope.htmlEditor.setValue($scope.editHtml);
    }

    $scope.$watch('editHtml', htmlEdit);

    $scope.htmlEditor = CodeMirror(document.getElementById('htmlEdit'), {
      lineNumbers: true, indentUnit: 4,
      mode: 'htmlmixed'
    });
    $scope.htmlEditor.on('change', function () {
      if ($scope.editHtml != $scope.htmlEditor.getValue()) {
        $scope.editHtml = $scope.htmlEditor.getValue();
        htmlEdit();
      }
    });
  })($scope, $http);

  $scope.confirm = function () {
    return confirm('Are you sure? Your local changes will be lost.');
  };

  $scope.getReqParams = function () {
    return $scope.generateErrorOnServer ? '?errorCode=' + $scope.serverErrorCode +
    '&errorMessage=' + $scope.serverErrorMsg : '';
  };

  angular.element(window).bind('dragover', function (e) {
    e.preventDefault();
  });
  angular.element(window).bind('drop', function (e) {
    e.preventDefault();
  });

  $scope.modelOptionsObj = {};
  $scope.$watch('validate+dragOverClass+modelOptions', function (v) {
    $scope.validateObj = eval('(function(){return ' + $scope.validate + ';})()');
    $scope.dragOverClassObj = eval('(function(){return ' + $scope.dragOverClass + ';})()');
    $scope.modelOptionsObj = eval('(function(){return ' + $scope.modelOptions + ';})()');
  });

  $timeout(function () {
    $scope.capture = localStorage.getItem('capture' + version) || 'camera';
    $scope.pattern = localStorage.getItem('pattern' + version) || 'image/*,audio/*,video/*';
    $scope.acceptSelect = localStorage.getItem('acceptSelect' + version) || 'image/*,audio/*,video/*';
    $scope.modelOptions = localStorage.getItem('modelOptions' + version) || '{debounce:100}';
    $scope.dragOverClass = localStorage.getItem('dragOverClass' + version) || '{accept:\'dragover\', reject:\'dragover-err\', pattern:\'image/*,audio/*,video/*,text/*\'}';
    $scope.disabled = localStorage.getItem('disabled' + version) == 'true' || false;
    $scope.multiple = localStorage.getItem('multiple' + version) == 'true' || false;
    $scope.allowDir = localStorage.getItem('allowDir' + version) == 'true' || true;
    $scope.validate = localStorage.getItem('validate' + version) || '{size: {max: \'20MB\', min: \'10B\'}, height: {max: 5000}, width: {max: 5000}, duration: {max: \'5m\'}}';
    $scope.keep = localStorage.getItem('keep' + version) == 'true' || false;
    $scope.keepDistinct = localStorage.getItem('keepDistinct' + version) == 'true' || false;
    $scope.$watch('validate+capture+pattern+acceptSelect+disabled+capture+multiple+allowDir+keep+' +
      'keepDistinct+modelOptions+dragOverClass', function () {
      localStorage.setItem('capture' + version, $scope.capture);
      localStorage.setItem('pattern' + version, $scope.pattern);
      localStorage.setItem('acceptSelect' + version, $scope.acceptSelect);
      localStorage.setItem('disabled' + version, $scope.disabled);
      localStorage.setItem('multiple' + version, $scope.multiple);
      localStorage.setItem('allowDir' + version, $scope.allowDir);
      localStorage.setItem('validate' + version, $scope.validate);
      localStorage.setItem('keep' + version, $scope.keep);
      localStorage.setItem('keepDistinct' + version, $scope.keepDistinct);
      localStorage.setItem('dragOverClass' + version, $scope.dragOverClass);
      localStorage.setItem('modelOptions' + version, $scope.modelOptions);
    });
  });
}]);
