'use strict';


var app = angular.module('fileUpload', ['ngFileUpload']);
var version = '6.0.0';

app.controller('MyCtrl', ['$scope', '$http', '$timeout', '$compile', 'Upload', function ($scope, $http, $timeout, $compile, Upload) {
    $scope.usingFlash = FileAPI && FileAPI.upload != null;
    //Upload.setDefaults({ngfKeep: true, ngfResetModelOnClick: false, ngfResetOnClick:false});
    $scope.changeAngularVersion = function () {
        window.location.hash = $scope.angularVersion;
        window.location.reload(true);
    };

    $scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ?
        window.location.hash.substring(2) : window.location.hash.substring(1)) : '1.2.20';

    $scope.$watch('files', function (files) {
        $scope.formUpload = false;
        if (files != null) {
            if (!angular.isArray(files)) {
                $scope.files = files = [files];
            }
            for (var i = 0; i < files.length; i++) {
                $scope.errorMsg = null;
                (function (f) {
                    upload(f);
                })(files[i]);
            }
        }
    });

    $scope.uploadPic = function(file) {
        $scope.formUpload = true;
        if (file != null) {
            upload(file)
        }
    };

    function upload(file) {
        $scope.errorMsg = null;
        if ($scope.howToSend === 1) {
            uploadUsingUpload(file);
        } else if ($scope.howToSend == 2) {
            uploadUsing$http(file);
        } else {
            uploadS3(file);
        }
    }

    function uploadUsingUpload(file) {
        file.upload = Upload.upload({
            url: 'https://angular-file-upload-cors-srv.appspot.com/upload' + $scope.getReqParams(),
            method: 'POST',
            headers: {
                'my-header': 'my-header-value'
            },
            fields: {username: $scope.username},
            file: file,
            fileFormDataName: 'myFile'
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
            fields: {
                key: file.name,
                AWSAccessKeyId: $scope.AWSAccessKeyId,
                acl: $scope.acl,
                policy: $scope.policy,
                signature: $scope.signature,
                'Content-Type': file.type === null || file.type === '' ? 'application/octet-stream' : file.type,
                filename: file.name
            },
            file: file
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
        $scope.defaultHtml = document.getElementById('editArea').innerHTML.replace(/\t\t\t\t/g, '');

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

    $timeout(function () {
        $scope.capture = localStorage.getItem('capture' + version) || 'camera';
        $scope.accept = localStorage.getItem('accept' + version) || 'image/*,audio/*,video/*';
        $scope.acceptSelect = localStorage.getItem('acceptSelect' + version) || 'image/*,audio/*,video/*';
        $scope.disabled = localStorage.getItem('disabled' + version) == 'true' || false;
        $scope.multiple = localStorage.getItem('multiple' + version) == 'true' || false;
        $scope.allowDir = localStorage.getItem('allowDir' + version) == 'true' || true;
        $scope.resetOnClick = localStorage.getItem('resetOnClick' + version) == 'true' || true;
        $scope.resetModelOnClick = localStorage.getItem('resetModelOnClick' + version) == 'true' || true;
        $scope.keep = localStorage.getItem('keep' + version) == 'true' || false;
        $scope.keepDistinct = localStorage.getItem('keepDistinct' + version) == 'true' || false;
        $scope.$watch('capture+accept+acceptSelect+disabled+capture+multiple+allowDir+resetOnClick+resetModelOnClick+keep+keepDistinct', function () {
            localStorage.setItem('capture' + version, $scope.capture);
            localStorage.setItem('accept' + version, $scope.accept);
            localStorage.setItem('acceptSelect' + version, $scope.acceptSelect);
            localStorage.setItem('disabled' + version, $scope.disabled);
            localStorage.setItem('multiple' + version, $scope.multiple);
            localStorage.setItem('allowDir' + version, $scope.allowDir);
            localStorage.setItem('resetOnClick' + version, $scope.resetOnClick);
            localStorage.setItem('resetModelOnClick' + version, $scope.resetModelOnClick);
            localStorage.setItem('keep' + version, $scope.keep);
            localStorage.setItem('keepDistinct' + version, $scope.keepDistinct);
        });
    });
}]);
