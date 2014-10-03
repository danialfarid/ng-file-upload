"use strict";


angular.module('fileUpload', [ 'angularFileUpload' ]);

var uploadUrl = (window.location.protocol || 'http:') + '//angular-file-upload-cors-srv.appspot.com/upload';
window.uploadUrl = window.uploadUrl || 'upload';
	
var MyCtrl = [ '$scope', '$http', '$timeout', '$upload', function($scope, $http, $timeout, $upload) {
	$scope.usingFlash = FileAPI && FileAPI.upload != null;
	$scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
	$scope.uploadRightAway = true;
	$scope.changeAngularVersion = function() {
		window.location.hash = $scope.angularVersion;
		window.location.reload(true);
	};
	$scope.hasUploader = function(index) {
		return $scope.upload[index] != null;
	};
	$scope.abort = function(index) {
		$scope.upload[index].abort(); 
		$scope.upload[index] = null;
	};
	$scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ? 
			window.location.hash.substring(2): window.location.hash.substring(1)) : '1.2.20';
	$scope.onFileSelect = function($files) {
		$scope.selectedFiles = [];
		$scope.progress = [];
		if ($scope.upload && $scope.upload.length > 0) {
			for (var i = 0; i < $scope.upload.length; i++) {
				if ($scope.upload[i] != null) {
					$scope.upload[i].abort();
				}
			}
		}
		$scope.upload = [];
		$scope.uploadResult = [];
		$scope.selectedFiles = $files;
		$scope.dataUrls = [];
		for ( var i = 0; i < $files.length; i++) {
			var $file = $files[i];
			if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
				var fileReader = new FileReader();
				fileReader.readAsDataURL($files[i]);
				var loadFile = function(fileReader, index) {
					fileReader.onload = function(e) {
						$timeout(function() {
							$scope.dataUrls[index] = e.target.result;
						});
					}
				}(fileReader, i);
			}
			$scope.progress[i] = -1;
			if ($scope.uploadRightAway) {
				$scope.start(i);
			}
		}
	};
	
	$scope.start = function(index) {
		$scope.progress[index] = 0;
		$scope.errorMsg = null;
		if ($scope.howToSend == 1) {
			//$upload.upload()
			$scope.upload[index] = $upload.upload({
				url: uploadUrl,
				method: $scope.httpMethod,
				headers: {'my-header': 'my-header-value'},
				data : {
					myModel : $scope.myModel,
					errorCode: $scope.generateErrorOnServer && $scope.serverErrorCode,
					errorMessage: $scope.generateErrorOnServer && $scope.serverErrorMsg
				},
				/* formDataAppender: function(fd, key, val) {
					if (angular.isArray(val)) {
                        angular.forEach(val, function(v) {
                          fd.append(key, v);
                        });
                      } else {
                        fd.append(key, val);
                      }
				}, */
				/* transformRequest: [function(val, h) {
					console.log(val, h('my-header')); return val + '-modified';
				}], */
				file: $scope.selectedFiles[index],
				fileFormDataName: 'myFile'
			});
			$scope.upload[index].then(function(response) {
				$timeout(function() {
					$scope.uploadResult.push(response.data);
				});
			}, function(response) {
				if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
			}, function(evt) {
				// Math.min is to fix IE which reports 200% sometimes
				$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			});
			$scope.upload[index].xhr(function(xhr){
//				xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
			});
		} else if ($scope.howToSend == 2) {
			//$upload.http()
			var fileReader = new FileReader();
            fileReader.onload = function(e) {
            	console.log('file is loaded in filereader');
		        $scope.upload[index] = $upload.http({
		        	url: uploadUrl,
					headers: {'Content-Type': $scope.selectedFiles[index].type},
					data: e.target.result
		        });
		        $scope.upload[index].then(function(response) {
					$scope.uploadResult.push(response.data);
				}, function(response) {
					if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
				}, function(evt) {
					// Math.min is to fix IE which reports 200% sometimes
					$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					console.log('progres', Math.min(100, parseInt(100.0 * evt.loaded / evt.total)))
				});
				$scope.upload[index].xhr(function(xhr){
					xhr.upload.addEventListener('progress', function(evt) {
						console.log('progres2', Math.min(100, parseInt(100.0 * evt.loaded / evt.total)))
					}, false);
					xhr.addEventListener('progress', function(evt) {
						console.log('progres3', Math.min(100, parseInt(100.0 * evt.loaded / evt.total)))
					}, false);
				});
            }
	        fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
		} else {
			//s3 upload
			$scope.upload[index] = $upload.upload({
				url: $scope.s3url,
				method: 'POST',
				data : {
					key: $scope.selectedFiles[index].name,
					AWSAccessKeyId: $scope.AWSAccessKeyId,
					acl: $scope.acl,
					policy: $scope.policy,
					signature: $scope.signature,
					"Content-Type": $scope.selectedFiles[index].type === null || $scope.selectedFiles[index].type === '' ?
										'application/octet-stream' : $scope.selectedFiles[index].type,
					filename: $scope.selectedFiles[index].name
				},
				file: $scope.selectedFiles[index],
			});
			$scope.upload[index].then(function(response) {
				$timeout(function() {
					$scope.uploadResult.push(response.data);
				});
			}, function(response) {
				if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
			}, function(evt) {
				// Math.min is to fix IE which reports 200% sometimes
				$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			});
			if (localStorage) {
				localStorage.setItem("s3url", $scope.s3url);
				localStorage.setItem("AWSAccessKeyId", $scope.AWSAccessKeyId);
				localStorage.setItem("acl", $scope.acl);
				localStorage.setItem("success_action_redirect", $scope.success_action_redirect);
				localStorage.setItem("policy", $scope.policy);
				localStorage.setItem("signature", $scope.signature);
			}
		}
	};
	
	$scope.dragOverClass = function($event) {
		var items = $event.dataTransfer.items;
		var hasFile = false;
		if (items != null) {
			for (var i = 0 ; i < items.length; i++) {
				if (items[i].kind == 'file') {
					hasFile = true;
					break;
				}
			}
		} else {
			hasFile = true;
		}
		return hasFile ? "dragover" : "dragover-err";
	};
	
	$scope.generateSignature = function() {
		$http.post('/s3sign?aws-secret-key=' + encodeURIComponent($scope.AWSSecretKey), $scope.jsonPolicy).
			success(function(data) {
				$scope.policy = data.policy;
				$scope.signature = data.signature;
			});
	}
	if (localStorage) {
		$scope.s3url = localStorage.getItem("s3url");
		$scope.AWSAccessKeyId = localStorage.getItem("AWSAccessKeyId");
		$scope.acl = localStorage.getItem("acl");
		$scope.success_action_redirect = localStorage.getItem("success_action_redirect");
		$scope.policy = localStorage.getItem("policy");
		$scope.signature = localStorage.getItem("signature");
	}
	$scope.success_action_redirect = $scope.success_action_redirect || window.location.protocol + "//" + window.location.host;
	$scope.jsonPolicy = $scope.jsonPolicy || '{\n  "expiration": "2020-01-01T00:00:00Z",\n  "conditions": [\n    {"bucket": "angular-file-upload"},\n    ["starts-with", "$key", ""],\n    {"acl": "private"},\n    ["starts-with", "$Content-Type", ""],\n    ["starts-with", "$filename", ""],\n    ["content-length-range", 0, 524288000]\n  ]\n}';
	$scope.acl = $scope.acl || 'private';
} ];
