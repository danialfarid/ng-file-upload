/**!
 * AngularJS file upload/drop directive with http post and progress
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.1.4
 */
(function() {
	
var angularFileUpload = angular.module('angularFileUpload', []);

angularFileUpload.service('$upload', ['$http', function($http) {
	this.upload = function(config) {
		config.method = config.method || 'POST';
		config.headers = config.headers || {};
		config.headers['Content-Type'] = undefined;
		var formData = new FormData();
		if (config.data) {
			for (var key in config.data) {
				var val = config.data[key];
				if (config.transformRequest) {
					if (typeof config.transformRequest == 'function') {
						val = config.transformRequest(val);
					} else {
						for (fn in config.transformRequest) {
							if (typeof fn == 'function') {
								val = fn(val);
							}
						}
					}
				} else {
					val = $http.defaults.transformRequest[0](val);
				}
				formData.append(key, val);
			}
		}
		config.transformRequest =  angular.identity;
		formData.append(config.fileFormDataName || 'file', config.file, config.file.name);
		formData['__uploadProgress_'] = function(e) {
			if (e) config.progress(e);
		};

		config.data = formData;
		
		var response = $http(config);

		response.abort = function(){throw "upload is not started yet"};
		formData['__setAbortFunction_'] = function(fn) {
			response.abort = fn;
		}
		
		return response;
	};
}]);

angularFileUpload.directive('ngFileSelect', [ '$parse', '$http', function($parse, $http) {
	return function(scope, elem, attr) {
		var fn = $parse(attr['ngFileSelect']);
		elem.bind('change', function(evt) {
			var files = [], fileList, i;
			fileList = evt.target.files;
			if (fileList != null) {
				for (i = 0; i < fileList.length; i++) {
					files.push(fileList.item(i));
				}
			}
			scope.$apply(function() {
				fn(scope, {
					$files : files,
					$event : evt
				});
			});
		});
		elem.bind('click', function(){
			this.value = null;
		});
	};
} ]);

angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$http', function($parse, $http) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var fn = $parse(attr['ngFileDropAvailable']);
			if(!scope.$$phase) {
				scope.$apply(function() {
					fn(scope);
				});
			} else {
				fn(scope)
			}
		}
	};
} ]);

angularFileUpload.directive('ngFileDrop', [ '$parse', '$http', function($parse, $http) {
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var fn = $parse(attr['ngFileDrop']);
			elem[0].addEventListener("dragover", function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				elem.addClass(attr['ngFileDragOverClass'] || "dragover");
			}, false);
			elem[0].addEventListener("dragleave", function(evt) {
				elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
			}, false);
			elem[0].addEventListener("drop", function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				elem.removeClass(attr['ngFileDragOverClass'] || "dragover");
				var files = [], fileList = evt.dataTransfer.files, i;
				if (fileList != null) {
					for (i = 0; i < fileList.length; i++) {
						files.push(fileList.item(i));
					}
				}
				scope.$apply(function() {
					fn(scope, {
						$files : files,
						$event : evt
					});
				});
			}, false);
		}
	};
} ]);

})();
