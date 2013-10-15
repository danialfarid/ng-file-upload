/**!
 * AngularJS file upload/drop directive with http post and progress
 * @author  Danial  <danial.farid@gmail.com>
 * @version 1.0.0
 */
var angularFileUpload = angular.module('angularFileUpload', []);

angularFileUpload.shouldLoadShim = typeof FormData === 'undefined';
angularFileUpload.isShimLoaded = typeof FileAPI !== 'undefined';

if (angularFileUpload.shouldLoadShim && !angularFileUpload.isShimLoaded) {
	if (typeof jQuery === 'undefined') {
		var script = document.createElement('script');
		script.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js');
		document.getElementsByTagName('head')[0].appendChild(script);
	}
	
	var base = '';

	if (typeof FormData === 'undefined') {
		var script = document.createElement('script');
		var allScripts = document.getElementsByTagName('script');

		for ( var i = 0; i < allScripts.length; i++) {
			var index = allScripts[i].src.indexOf('angular-file-upload.js')
			if (index == -1) {
				index = allScripts[i].src.indexOf('angular-file-upload.min.js');
			}
			if (index > -1) {
				base = allScripts[i].src.substring(0, index);
				break;
			}
		}

		if (typeof FileAPI === "undefined" || FileAPI.staticPath == null) {
			FileAPI = {
				staticPath : base
			}
		}

		script.setAttribute('src', base + 'FileAPI.min.js');
		document.getElementsByTagName('head')[0].appendChild(script);
		angularFileUpload.isShimLoaded = true;
	}
}

angularFileUpload.XMLHttpRequest = function() {
	if (angularFileUpload.shouldLoadShim) {
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
	if ($http.uploadFile === undefined) {
		$http.uploadFile = function(config) {
			var xhr = new angularFileUpload.XMLHttpRequest();
			var then, success, error, progress;
			
			var formData = new FormData();
			formData.append('file', config.file);
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
					var JSON_START = /^\s*(\[|\{[^\{])/, JSON_END = /[\}\]]\s*$/, PROTECTION_PREFIX = /^\)\]\}',?\n/;
					var data = xhr.responseText;
					if (typeof data == 'string') {
						// strip json vulnerability protection prefix
						data = data.replace(PROTECTION_PREFIX, '');
						if (JSON_START.test(data) && JSON_END.test(data))
							data = (typeof data == 'string') ? JSON.parse(data)
									: data;
					}
					var responseHeaders = xhr.getAllResponseHeaders();					
			        if (200 <= xhr.status && xhr.status < 300) {
						if (then != null)
							then(data, xhr.status, responseHeaders, config);							
						if (success != null)
							success(data, xhr.status, responseHeaders, config);
					} else {
						if (error != null)
							error(data, xhr.status, responseHeaders, config);							
					}
				}
			}
			
			xhr.upload.addEventListener('progress', function(e) {
				if (progress) progress(e);
			}, false);
	
			var response = {
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
		if (angularFileUpload.shouldLoadShim) {
			elem.wrap('<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden">');
		}
		elem.bind('change', function(evt) {
			var files = [];
			if (!angularFileUpload.shouldLoadShim) {
				var fileList = evt.target.files;
				if (fileList != null) {
					for ( var i = 0; i < fileList.length; i++) {
						files.push(fileList.item(i));
					}
				}
			} else {
				files = FileAPI.getFiles(evt);
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
				var files = [];
				var fileList = evt.dataTransfer.files;
				if (fileList != null) {
					for ( var i = 0; i < fileList.length; i++) {
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