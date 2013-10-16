/**!
 * AngularJS file upload/drop directive with http post and progress
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.0.2
 */
(function() {
	
var angularFileUpload = angular.module('angularFileUpload', []);

angularFileUpload.html5 = !!window.FormData;

if (!angularFileUpload.html5) {
	(function () {
		//load FileAPI
		if (!window.FileAPI || !FileAPI.upload) {
			var base = '', script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index;
			if (window.FileAPI && window.FileAPI.jsPath) {
				base = window.FileAPI.jsPath;
			} else {
				for (i = 0; i < allScripts.length; i++) {
					index = allScripts[i].src.indexOf('angular-file-upload.js')
					if (index == -1) {
						index = allScripts[i].src.indexOf('angular-file-upload.min.js');
					}
					if (index > -1) {
						base = allScripts[i].src.substring(0, index);
						break;
					}
				}
			}

			if (!window.FileAPI || FileAPI.staticPath == null) {
				FileAPI = {
					staticPath: base
				}
			}
	
			script.setAttribute('src', base + 'FileAPI.min.js');
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	})();
}

angularFileUpload.XMLHttpRequest = function() {
	if (!angularFileUpload.html5) {
		window.FormData = FormData = function() {
			return {
				append: function(key, val) {
					this[key] = val;
				}
			};
		};
		var xhr = {
			onreadystatechange: function(){},
			headers: {},
			responseHeaders: {},
			config: {
				complete: function(err, x) {
					xhr.status = x.status;
					xhr.readyState = 4;
					xhr.responseHeaders = x.getAllResponseHeaders();
					xhr.responseText = x.responseText;
					xhr.onreadystatechange();
				}
			},
			getAllResponseHeaders: function() {
				return this.responseHeaders;
			},
			setRequestHeader: function(key, value) {
				this.headers[key] = value;
			},
			open: function(method, url, b) {
				this.config.url = url;
			},
			upload: {
				addEventListener: function(evt, listener) {
					xhr.config.progress = listener;
				}
			},
			send: function(formData) {
				this.config.files = {
					file : formData.file
				};
				this.config.data = {}
				for (key in formData) {
					if (key != 'file' && key != 'append') {
						this.config.data[key] = formData[key];
					}
				}
				this.config.headers = this.headers;
				FileAPI.upload(this.config);				
			},
			readyState: 0,
			status: 0,
			responseText: null
		};
		return xhr;
	} else {
		return new XMLHttpRequest();
	}
};

angularFileUpload.defineHttpUploadFile = function($http) {
	if (!$http.uploadFile) {
		$http.uploadFile = function(config) {
			var xhr = new angularFileUpload.XMLHttpRequest(), then, success, error, progress, response, 
				formData = new FormData();
			formData.append(config.fileFormDataName || 'file', config.file);
			for (key in config.data) {
				formData.append(key, config.data[key]);
			}
			xhr.open(config.method || 'POST', config.url, true);
	
			config.headers = config.headers || {};
			for (key in config.headers) {
				xhr.setRequestHeader(key, config.headers[key]);
			}
	
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var JSON_START = /^\s*(\[|\{[^\{])/, JSON_END = /[\}\]]\s*$/, PROTECTION_PREFIX = /^\)\]\}',?\n/, 
						data = xhr.responseText, responseHeaders = xhr.getAllResponseHeaders(); 
					if (typeof data == 'string') {
						// strip json vulnerability protection prefix
						data = data.replace(PROTECTION_PREFIX, '');
						if (JSON_START.test(data) && JSON_END.test(data))
							data = (typeof data === 'string') ? JSON.parse(data) : data;
					}
			        if (200 <= xhr.status && xhr.status < 300) {
						if (then) then(data, xhr.status, responseHeaders, config);							
						if (success) success(data, xhr.status, responseHeaders, config);
					} else {
						if (error) error(data, xhr.status, responseHeaders, config);							
					}
				}
			}
			
			xhr.upload.addEventListener('progress', function(e) {
				if (progress) progress(e);
			}, false);
	
			response = {
				then: function(func) {
					then = func;
					return response;
				},
				success: function(func) {
					success = func;
					return response;
				},
				error: function(func) {
					error = func;
					return response;
				},
				progress: function(func) {
					progress = func;
					return response;
				}
			};
			
			xhr.send(formData);
	
			return response;
		};
	}
}


angularFileUpload.directive('ngFileSelect', [ '$parse', '$http', function($parse, $http) {
	angularFileUpload.defineHttpUploadFile($http);
	
	return function(scope, elem, attr) {
		var fn = $parse(attr['ngFileSelect']);
		if (!angularFileUpload.html5) {
			elem.wrap('<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden">');
		}
		elem.bind('change', function(evt) {
			var files = [], fileList, i;
			if (!angularFileUpload.html5) {
				files = FileAPI.getFiles(evt);
			} else {
				fileList = evt.target.files;
				if (fileList != null) {
					for (i = 0; i < fileList.length; i++) {
						files.push(fileList.item(i));
					}
				}
			}
			scope.$apply(function() {
				fn(scope, {
					$files : files,
					$event : evt
				});
			});
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
	angularFileUpload.defineHttpUploadFile($http);
	return function(scope, elem, attr) {
		if ('draggable' in document.createElement('span')) {
			var fn = $parse(attr['ngFileDrop']);
			elem[0].addEventListener("dragover", function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				elem.addClass("dragover");
			}, false);
			elem[0].addEventListener("dragleave", function(evt) {
				elem.removeClass("dragover");
			}, false);
			elem[0].addEventListener("drop", function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				elem.removeClass("dragover");
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
		} else {
			elem.css('display', 'none');
		}
	};
} ]);

})();