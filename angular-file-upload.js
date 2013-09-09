/**!
 * AngularJS file upload directive and http post
 * @author  Danial  <danial.farid@gmail.com>
 * @version 0.1.3
 */
var angularFileUpload = angular.module('angularFileUpload', []);

(function loadFileAPI() {
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
	}
})();

angularFileUpload.directive('ngFileSelect', [ '$parse', '$http', function($parse, $http) {
	if ($http.uploadFile === undefined) {
		$http.uploadFile = function(config) {
			if (typeof FormData === 'undefined') {
				config.complete = function(err, xhr) {
					var JSON_START = /^\s*(\[|\{[^\{])/, JSON_END = /[\}\]]\s*$/, PROTECTION_PREFIX = /^\)\]\}',?\n/;
					var data = xhr.responseText;
					if (typeof data == 'string') {
						// strip json vulnerability protection prefix
						data = data.replace(PROTECTION_PREFIX, '');
						if (JSON_START.test(data) && JSON_END.test(data))
							data = (typeof data == 'string') ? JSON.parse(data)
									: data;
					}
					if (config.promiseThen != null)
						config.promiseThen(data, xhr.status, null, config);
					if (config.promiseError != null)
						config.promiseError(data, xhr.status, null, config);
					if (config.promiseSuccess != null)
						config.promiseSuccess(data, xhr.status, null, config);
				}
				if (config.file != null) {
					config.files = {
						file : config.file
					}
				}
				var xhr = FileAPI.upload(config);
				return {
					then : function(func) {
						config.promiseThen = func;
					},
					success : function(func) {
						config.promiseSuccess = func;
					},
					error : function(func) {
						config.promiseError = func;
					}
				};
			} else {
				config.method = config.method || 'POST';
				config.headers = config.headers || {};
				config.headers['Content-Type'] = false;
				config.transformRequest = function(data) {
					var formData = new FormData();
					formData.append('file', config.file);
					for (key in config.data) {
						formData.append(key, config.data[key]);
					}
					return formData;
				}
				return $http(config);
			}
		};
	}
	
	return function(scope, elem, attr) {
		if (typeof FormData === 'undefined') {
			elem.wrap('<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden">');
		}
		var fn = $parse(attr['ngFileSelect']);
		elem.bind('change', function(evt) {
			var files = [];
			if (typeof FormData !== 'undefined') {
				var fileList = evt.target.files;
				for ( var i = 0; i < fileList.length; i++) {
					files.push(fileList.item(i));
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
