"use strict";


var app = angular.module('fileUpload', [ 'angularFileUpload' ]);
var version = '2.0.4';

app.controller('MyCtrl', [ '$scope', '$http', '$timeout', '$compile', '$upload', function($scope, $http, $timeout, $compile, $upload) {
	$scope.usingFlash = FileAPI && FileAPI.upload != null;
	$scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

	$scope.changeAngularVersion = function() {
		window.location.hash = $scope.angularVersion;
		window.location.reload(true);
	};
	
	$scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ? 
			window.location.hash.substring(2): window.location.hash.substring(1)) : '1.2.20';
			
	$scope.$watch('files', function(files) {
		$scope.formUpload = false;
		if (files != null) {
			for (var i = 0; i < files.length; i++) {
				$scope.errorMsg = null;
				(function(file) {
					$scope.generateThumb(file);
					eval($scope.uploadScript);
				})(files[i]);
			}
		}
		storeS3UploadConfigInLocalStore();
	});
	
	$scope.uploadPic = function(files) {
		$scope.formUpload = true;
		if (files != null) {
			var file = files[0];
			$scope.generateThumb(file);
			$scope.errorMsg = null;
			eval($scope.uploadScript);	
		}
	}
	
	$scope.generateThumb = function(file) {
		if (file != null) {
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							file.dataUrl = e.target.result;
						});
					}
				});
			}
		}
	}
	
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
	
	function storeS3UploadConfigInLocalStore() {
		if ($scope.howToSend == 3 && localStorage) {
			localStorage.setItem("s3url", $scope.s3url);
			localStorage.setItem("AWSAccessKeyId", $scope.AWSAccessKeyId);
			localStorage.setItem("acl", $scope.acl);
			localStorage.setItem("success_action_redirect", $scope.success_action_redirect);
			localStorage.setItem("policy", $scope.policy);
			localStorage.setItem("signature", $scope.signature);
		}
	}
	
	(function handleDynamicEditingOfScriptsAndHtml($scope, $http) {
		$scope.defaultUploadScript = [];
		$http.get('js/upload-upload.js').success(function(data) {
			$scope.defaultUploadScript[1] = data; $scope.uploadScript = $scope.uploadScript || data
		});
		$http.get('js/upload-http.js').success(function(data) {$scope.defaultUploadScript[2] = data});
		$http.get('js/upload-s3.js').success(function(data) {$scope.defaultUploadScript[3] = data});
		
		$scope.defaultHtml = document.getElementById('editArea').innerHTML.replace(/\t\t\t\t/g, '');
		
		$scope.editHtml = (localStorage && localStorage.getItem("editHtml" + version)) || $scope.defaultHtml;
		function htmlEdit(update) {
			document.getElementById("editArea").innerHTML = $scope.editHtml;
			$compile(document.getElementById("editArea"))($scope);
			$scope.editHtml && localStorage && localStorage.setItem("editHtml" + version, $scope.editHtml);
			if ($scope.editHtml != $scope.htmlEditor.getValue()) $scope.htmlEditor.setValue($scope.editHtml);
		}
		$scope.$watch("editHtml", htmlEdit);
		
		$scope.$watch("howToSend", function(newVal, oldVal) {
			$scope.uploadScript && localStorage && localStorage.setItem("uploadScript" + oldVal + version, $scope.uploadScript);
			$scope.uploadScript = (localStorage && localStorage.getItem("uploadScript" + newVal + version)) || $scope.defaultUploadScript[newVal]; 
		});
		
		function jsEdit(update) {
			$scope.uploadScript && localStorage && localStorage.setItem("uploadScript" + $scope.howToSend + version, $scope.uploadScript);
			if ($scope.uploadScript != $scope.jsEditor.getValue()) $scope.jsEditor.setValue($scope.uploadScript);
		}
		$scope.$watch("uploadScript", jsEdit);

		$scope.htmlEditor = CodeMirror(document.getElementById('htmlEdit'), {
			lineNumbers: true, indentUnit: 4,
			mode:  "htmlmixed"
		});
		$scope.htmlEditor.on('change', function() {
			if ($scope.editHtml != $scope.htmlEditor.getValue()) {
				$scope.editHtml = $scope.htmlEditor.getValue();
				htmlEdit();
			}
		});
		$scope.jsEditor = CodeMirror(document.getElementById('jsEdit'), {
			lineNumbers: true, indentUnit: 4,
			mode:  "javascript"
		});
		$scope.jsEditor.on('change', function() {
			if ($scope.uploadScript != $scope.jsEditor.getValue()) {
				$scope.uploadScript = $scope.jsEditor.getValue();
				jsEdit();
			}
		});
	})($scope, $http);
	
	$scope.confirm = function() {
		return confirm('Are you sure? Your local changes will be lost.');
	}
	
	$scope.getReqParams = function() {
		return $scope.generateErrorOnServer ? "?errorCode=" + $scope.serverErrorCode + 
				"&errorMessage=" + $scope.serverErrorMsg : "";
	}

	window.addEventListener("dragover", function(e) {
		e.preventDefault();
	}, false);
	window.addEventListener("drop", function(e) {
		e.preventDefault();
	}, false);
	
} ]);
