/**!
 * AngularJS file upload/drop directive with progress and abort
 * @author  Danial  <danial.farid@gmail.com>
 * @version 2.0.4
 */
(function() {
	
function patchXHR(fnName, newFn) {
	window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
}

if (window.XMLHttpRequest && !window.XMLHttpRequest.__isFileAPIShim) {
	patchXHR('setRequestHeader', function(orig) {
		return function(header, value) {
			if (header === '__setXHR_') {
				var val = value(this);
				// fix for angular < 1.2.0
				if (val instanceof Function) {
					val(this);
				}
			} else {
				orig.apply(this, arguments);
			}
		}
	});
}
	
var angularFileUpload = angular.module('angularFileUpload', []);
angularFileUpload.version = '2.0.4';
angularFileUpload.service('$upload', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
	function sendHttp(config) {
		config.method = config.method || 'POST';
		config.headers = config.headers || {};
		config.transformRequest = config.transformRequest || function(data, headersGetter) {
			if (window.ArrayBuffer && data instanceof window.ArrayBuffer) {
				return data;
			}
			return $http.defaults.transformRequest[0](data, headersGetter);
		};
		var deferred = $q.defer();
		var promise = deferred.promise;

		config.headers['__setXHR_'] = function() {
			return function(xhr) {
				if (!xhr) return;
				config.__XHR = xhr;
				config.xhrFn && config.xhrFn(xhr);
				xhr.upload.addEventListener('progress', function(e) {
					e.config = config;
					deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
				}, false);
				//fix for firefox not firing upload progress end, also IE8-9
				xhr.upload.addEventListener('load', function(e) {
					if (e.lengthComputable) {
						e.config = config;
						deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function(){promise.progress_fn(e)});
					}
				}, false);
			};
		};

		$http(config).then(function(r){deferred.resolve(r)}, function(e){deferred.reject(e)}, function(n){deferred.notify(n)});
		
		promise.success = function(fn) {
			promise.then(function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};

		promise.error = function(fn) {
			promise.then(null, function(response) {
				fn(response.data, response.status, response.headers, config);
			});
			return promise;
		};

		promise.progress = function(fn) {
			promise.progress_fn = fn;
			promise.then(null, null, function(update) {
				fn(update);
			});
			return promise;
		};
		promise.abort = function() {
			if (config.__XHR) {
				$timeout(function() {
					config.__XHR.abort();
				});
			}
			return promise;
		};
		promise.xhr = function(fn) {
			config.xhrFn = (function(origXhrFn) {
				return function() {
					origXhrFn && origXhrFn.apply(promise, arguments);
					fn.apply(promise, arguments);
				}
			})(config.xhrFn);
			return promise;
		};
		
		return promise;
	}

	this.upload = function(config) {
		config.headers = config.headers || {};
		config.headers['Content-Type'] = undefined;
		config.transformRequest = config.transformRequest || $http.defaults.transformRequest;
		var formData = new FormData();
		var origTransformRequest = config.transformRequest;
		var origData = config.data;
		config.transformRequest = function(formData, headerGetter) {
			if (origData) {
				if (config.formDataAppender) {
					for (var key in origData) {
						var val = origData[key];
						config.formDataAppender(formData, key, val);
					}
				} else {
					for (var key in origData) {
						var val = origData[key];
						if (typeof origTransformRequest == 'function') {
							val = origTransformRequest(val, headerGetter);
						} else {
							for (var i = 0; i < origTransformRequest.length; i++) {
								var transformFn = origTransformRequest[i];
								if (typeof transformFn == 'function') {
									val = transformFn(val, headerGetter);
								}
							}
						}
						if (val != undefined) formData.append(key, val);
					}
				}
			}

			if (config.file != null) {
				var fileFormName = config.fileFormDataName || 'file';

				if (Object.prototype.toString.call(config.file) === '[object Array]') {
					var isFileFormNameString = Object.prototype.toString.call(fileFormName) === '[object String]';
					for (var i = 0; i < config.file.length; i++) {
						formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i], 
								(config.fileName && config.fileName[i]) || config.file[i].name);
					}
				} else {
					formData.append(fileFormName, config.file, config.fileName || config.file.name);
				}
			}
			return formData;
		};

		config.data = formData;

		return sendHttp(config);
	};

	this.http = function(config) {
		return sendHttp(config);
	};
}]);

angularFileUpload.directive('ngFileSelect', [ '$parse', '$timeout', function($parse, $timeout) { return {
	restrict: 'AEC',
	require:'?ngModel',
	scope: {
		fileModel: '=ngModel',
		change: '&ngFileChange',
		select : '&ngFileSelect',
		resetOnClick: '&resetOnClick',
		multiple: '&ngMultiple',
		accept: '&ngAccept'
	},
	link: function(scope, elem, attr, ngModel) {
		handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout);
	}
}}]);

function handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout) {
	if (scope.multiple()) {
		elem.attr('multiple', 'true');
		attr['multiple'] = 'true';
	}
	var accept = scope.accept();
	if (accept) {
		elem.attr('accept', accept);
		attr['accept'] = accept;
	}
	if (elem[0].tagName.toLowerCase() !== 'input' || (elem.attr('type') && elem.attr('type').toLowerCase()) !== 'file') {
		var fileElem = angular.element('<input type="file">')
		if (attr['multiple']) fileElem.attr('multiple', attr['multiple']);
		if (attr['accept']) fileElem.attr('accept', attr['accept']);
		fileElem.css('width', '1px').css('height', '1px').css('opacity', 0).css('position', 'absolute').css('filter', 'alpha(opacity=0)')
				.css('padding', 0).css('margin', 0).css('overflow', 'hidden').attr('tabindex', '-1').attr('ng-file-generated-elem', true);
		elem.append(fileElem);
		elem.__afu_fileClickDelegate__ = function() {
			fileElem[0].click();
		}; 
		elem.bind('click', elem.__afu_fileClickDelegate__);
		elem.css('overflow', 'hidden');
		elem = fileElem;
	}
	if (scope.resetOnClick() != false) {
		elem.bind('click', function(evt) {
			if (elem[0].value) {
				updateModel([], attr, ngModel, scope, evt);
			}
			elem[0].value = null;
		});
	}
	if (ngModel) {
		scope.$parent.$watch(attr['ngModel'], function(val) {
			if (val == null) {
				elem[0].value = null;
			}
		});
	}
	if (attr['ngFileSelect'] != '') {
		scope.change = scope.select;
	}
	elem.bind('change', function(evt) {
		var files = [], fileList, i;
		fileList = evt.__files_ || evt.target.files;
		updateModel(fileList, attr, ngModel, scope, evt);
	});
	
	function updateModel(fileList, attr, ngModel, scope, evt) {
		$timeout(function() {
			var files = [];
			for (var i = 0; i < fileList.length; i++) {
				files.push(fileList.item(i));
			}
			if (ngModel) {
				scope.fileModel = files;
				ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
			}
			$timeout(function() {
				scope.change({
					$files : files,
					$event : evt
				});
			});
		});
	}
}

angularFileUpload.directive('ngFileDrop', [ '$parse', '$timeout', '$location', function($parse, $timeout, $location) { return {
	restrict: 'AEC',
	require:'?ngModel',
	scope: {
		fileModel: '=ngModel',
		fileRejectedModel: '=ngFileRejectedModel',
		change: '&ngFileChange',
		drop: '&ngFileDrop',
		allowDir: '&allowDir',
		dragOverClass: '&dragOverClass',
		dropAvailable: '=dropAvailable', 
		stopPropagation: '&stopPropagation',
		hideOnDropNotAvailable: '&hideOnDropNotAvailable',
		multiple: '&ngMultiple',
		accept: '&ngAccept'
	},
	link: function(scope, elem, attr, ngModel) {
		handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
	}
}}]);

angularFileUpload.directive('ngNoFileDrop', function() { 
	return function(scope, elem, attr) {
		if (dropAvailable()) elem.css('display', 'none')
	}
});

//for backward compatibility
angularFileUpload.directive('ngFileDropAvailable', [ '$parse', '$timeout', function($parse, $timeout) { 
	return function(scope, elem, attr) {
		if (dropAvailable()) {
			var fn = $parse(attr['ngFileDropAvailable']);
			$timeout(function() {
				fn(scope);
			});
		}
	}
}]);

function handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
	var available = dropAvailable();
	if (attr['dropAvailable']) {
		$timeout(function() {
			scope.dropAvailable = available;
		});
	}
	if (!available) {
		if (scope.hideOnDropNotAvailable() != false) {
			elem.css('display', 'none');
		}
		return;
	}
	var leaveTimeout = null;
	var stopPropagation = scope.stopPropagation();
	var dragOverDelay = 1;
	var accept = scope.accept() || attr['accept'] || attr['ngAccept'];
	var regexp = accept ? new RegExp(globStringToRegex(accept)) : null;
	elem[0].addEventListener('dragover', function(evt) {
		evt.preventDefault();
		if (stopPropagation) evt.stopPropagation();
		$timeout.cancel(leaveTimeout);
		if (!scope.actualDragOverClass) {
			scope.actualDragOverClass = calculateDragOverClass(scope, attr, evt);
		}
		elem.addClass(scope.actualDragOverClass);
	}, false);
	elem[0].addEventListener('dragenter', function(evt) {
		evt.preventDefault();
		if (stopPropagation) evt.stopPropagation();
	}, false);
	elem[0].addEventListener('dragleave', function(evt) {
		leaveTimeout = $timeout(function() {
			elem.removeClass(scope.actualDragOverClass);
			scope.actualDragOverClass = null;
		}, dragOverDelay || 1);
	}, false);
	if (attr['ngFileDrop'] != '') {
		scope.change = scope.drop;
	}
	elem[0].addEventListener('drop', function(evt) {
		evt.preventDefault();
		if (stopPropagation) evt.stopPropagation();
		elem.removeClass(scope.actualDragOverClass);
		scope.actualDragOverClass = null;
		extractFiles(evt, function(files, rejFiles) {
			if (ngModel) {
				scope.fileModel = files;
				ngModel && ngModel.$setViewValue(files != null && files.length == 0 ? '' : files);
			}
			if (attr['ngFileRejectedModel']) scope.fileRejectedModel = rejFiles;
			$timeout(function(){
				scope.change({
					$files : files,
					$rejectedFiles: rejFiles,
					$event : evt
				});
			});
		}, scope.allowDir() != false, attr['multiple'] || scope.multiple() || attr['ngMultiple'] == 'true');
	}, false);
	
	function calculateDragOverClass(scope, attr, evt) {
		var valid = true;
		if (regexp) {
			var items = evt.dataTransfer.items;
			if (items != null) {
				for (var i = 0 ; i < items.length && valid; i++) {
					valid = valid && (items[i].kind == 'file' || items[i].kind == '') && 
						(items[i].type.match(regexp) != null || (items[i].name != null && items[i].name.match(regexp) != null));
				}
			}
		}
		var clazz = scope.dragOverClass({$event : evt});
		if (clazz) {
			if (clazz.delay) dragOverDelay = clazz.delay; 
			if (clazz.accept) clazz = valid ? clazz.accept : clazz.reject;
		}
		return clazz || attr['dragOverClass'] || 'dragover';
	}
				
	function extractFiles(evt, callback, allowDir, multiple) {
		var files = [], rejFiles = [], items = evt.dataTransfer.items;
		
		function addFile(file) {
			if (!regexp || file.type.match(regexp) || (file.name != null && file.name.match(regexp))) {
				files.push(file);
			} else {
				rejFiles.push(file);
			}
		}
		
		if (items && items.length > 0 && $location.protocol() != 'file') {
			for (var i = 0; i < items.length; i++) {
				if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
					var entry = items[i].webkitGetAsEntry();
					if (entry.isDirectory && !allowDir) {
						continue;
					}
					if (entry != null) {
						//fix for chrome bug https://code.google.com/p/chromium/issues/detail?id=149735
						if (isASCII(entry.name)) {
							traverseFileTree(files, entry);
						} else if (!items[i].webkitGetAsEntry().isDirectory) {
							addFile(items[i].getAsFile());
						}
					}
				} else {
					var f = items[i].getAsFile();
					if (f != null) addFile(f);
				}
				if (!multiple && files.length > 0) break;
			}
		} else {
			var fileList = evt.dataTransfer.files;
			if (fileList != null) {
				for (var i = 0; i < fileList.length; i++) {
					addFile(fileList.item(i));
					if (!multiple && files.length > 0) break;
				}
			}
		}
		var delays = 0;
		(function waitForProcess(delay) {
			$timeout(function() {
				if (!processing) {
					if (!multiple && files.length > 1) {
						var i = 0;
						while (files[i].type == 'directory') i++;
						files = [files[i]];
					}
					callback(files, rejFiles);
				} else {
					if (delays++ * 10 < 20 * 1000) {
						waitForProcess(10);
					}
				}
			}, delay || 0)
		})();
		
		var processing = 0;
		function traverseFileTree(files, entry, path) {
			if (entry != null) {
				if (entry.isDirectory) {
					addFile({name: entry.name, type: 'directory', path: (path ? path : '') + entry.name});
					var dirReader = entry.createReader();
					processing++;
					dirReader.readEntries(function(entries) {
						try {
							for (var i = 0; i < entries.length; i++) {
								traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
							}
						} finally {
							processing--;
						}
					});
				} else {
					processing++;
					entry.file(function(file) {
						processing--;
						file.path = (path ? path : '') + file.name;
						addFile(file);
					});
				}
			}
		}
	}
}

function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
}

function isASCII(str) {
	return /^[\000-\177]*$/.test(str);
}

function globStringToRegex(str) {
	if (str.length > 2 && str[0] === '/' && str[str.length -1] === '/') {
		return str.substring(1, str.length - 1);
	}
	var split = str.split(','), result = '';
	if (split.length > 1) {
		for (var i = 0; i < split.length; i++) {
			result += '(' + globStringToRegex(split[i]) + ')';
			if (i < split.length - 1) {
				result += '|'
			}
		}
	} else {
		result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
		result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
	}
	return result;
}

})();

/**!
 * AngularJS file upload/drop directive with progress and abort
 * FileAPI Flash shim for old browsers not supporting FormData 
 * @author  Danial  <danial.farid@gmail.com>
 * @version 2.0.4
 */

(function() {

var hasFlash = function() {
	try {
	  var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	  if (fo) return true;
	} catch(e) {
	  if (navigator.mimeTypes['application/x-shockwave-flash'] != undefined) return true;
	}
	return false;
}

function patchXHR(fnName, newFn) {
	window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
};

if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {
	var initializeUploadListener = function(xhr) {
		if (!xhr.__listeners) {
			if (!xhr.upload) xhr.upload = {};
			xhr.__listeners = [];
			var origAddEventListener = xhr.upload.addEventListener;
			xhr.upload.addEventListener = function(t, fn, b) {
				xhr.__listeners[t] = fn;
				origAddEventListener && origAddEventListener.apply(this, arguments);
			};
		}
	}
	
	patchXHR('open', function(orig) {
		return function(m, url, b) {
			initializeUploadListener(this);
			this.__url = url;
			try {
				orig.apply(this, [m, url, b]);
			} catch (e) {
				if (e.message.indexOf('Access is denied') > -1) {
					orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
				}
			}
		}
	});

	patchXHR('getResponseHeader', function(orig) {
		return function(h) {
			return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
		};
	});

	patchXHR('getAllResponseHeaders', function(orig) {
		return function() {
			return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
		}
	});

	patchXHR('abort', function(orig) {
		return function() {
			return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
		}
	});

	patchXHR('setRequestHeader', function(orig) {
		return function(header, value) {
			if (header === '__setXHR_') {
				initializeUploadListener(this);
				var val = value(this);
				// fix for angular < 1.2.0
				if (val instanceof Function) {
					val(this);
				}
			} else {
				this.__requestHeaders = this.__requestHeaders || {};
				this.__requestHeaders[header] = value;
				orig.apply(this, arguments);
			}
		}
	});
	
	function redefineProp(xhr, prop, fn) {
		try {
			Object.defineProperty(xhr, prop, {get: fn});
		} catch (e) {/*ignore*/}
	}

	patchXHR('send', function(orig) {
		return function() {
			var xhr = this;
			if (arguments[0] && arguments[0].__isFileAPIShim) {
				var formData = arguments[0];
				var config = {
					url: xhr.__url,
					jsonp: false, //removes the callback form param
					cache: true, //removes the ?fileapiXXX in the url
					complete: function(err, fileApiXHR) {
						xhr.__completed = true;
						if (!err && xhr.__listeners['load']) 
							xhr.__listeners['load']({type: 'load', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
						if (!err && xhr.__listeners['loadend']) 
							xhr.__listeners['loadend']({type: 'loadend', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
						if (err === 'abort' && xhr.__listeners['abort']) 
							xhr.__listeners['abort']({type: 'abort', loaded: xhr.__loaded, total: xhr.__total, target: xhr, lengthComputable: true});
						if (fileApiXHR.status !== undefined) redefineProp(xhr, 'status', function() {return (fileApiXHR.status == 0 && err && err !== 'abort') ? 500 : fileApiXHR.status});
						if (fileApiXHR.statusText !== undefined) redefineProp(xhr, 'statusText', function() {return fileApiXHR.statusText});
						redefineProp(xhr, 'readyState', function() {return 4});
						if (fileApiXHR.response !== undefined) redefineProp(xhr, 'response', function() {return fileApiXHR.response});
						var resp = fileApiXHR.responseText || (err && fileApiXHR.status == 0 && err !== 'abort' ? err : undefined);
						redefineProp(xhr, 'responseText', function() {return resp});
						redefineProp(xhr, 'response', function() {return resp});
						if (err) redefineProp(xhr, 'err', function() {return err});
						xhr.__fileApiXHR = fileApiXHR;
						if (xhr.onreadystatechange) xhr.onreadystatechange();
						if (xhr.onload) xhr.onload();
					},
					fileprogress: function(e) {
						e.target = xhr;
						xhr.__listeners['progress'] && xhr.__listeners['progress'](e);
						xhr.__total = e.total;
						xhr.__loaded = e.loaded;
						if (e.total === e.loaded) {
							// fix flash issue that doesn't call complete if there is no response text from the server  
							var _this = this
							setTimeout(function() {
								if (!xhr.__completed) {
									xhr.getAllResponseHeaders = function(){};
									_this.complete(null, {status: 204, statusText: 'No Content'});
								}
							}, 10000);
						}
					},
					headers: xhr.__requestHeaders
				}
				config.data = {};
				config.files = {}
				for (var i = 0; i < formData.data.length; i++) {
					var item = formData.data[i];
					if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
						config.files[item.key] = item.val;
					} else {
						config.data[item.key] = item.val;
					}
				}

				setTimeout(function() {
					if (!hasFlash()) {
						throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
					}
					xhr.__fileApiXHR = FileAPI.upload(config);
				}, 1);
			} else {
				orig.apply(xhr, arguments);
			}
		}
	});
	window.XMLHttpRequest.__isFileAPIShim = true;

	var addFlash = function(elem) {
		if (!hasFlash()) {
			throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
		}
		var el = angular.element(elem);
		if (!el.attr('disabled')) {
			if (!el.hasClass('js-fileapi-wrapper') && (el.attr('ng-file-select') != null || el.attr('data-ng-file-select') != null ||
					(el.attr('ng-file-generated-elem') && 
							(el.parent().attr('ng-file-select') != null || el.parent().attr('data-ng-file-select') != null)))) {
				if (FileAPI.wrapInsideDiv) {
					var wrap = document.createElement('div');
					wrap.innerHTML = '<div class="js-fileapi-wrapper" style="position:relative; overflow:hidden"></div>';
					wrap = wrap.firstChild;
					var parent = elem.parentNode;
					parent.insertBefore(wrap, elem);
					parent.removeChild(elem);
					wrap.appendChild(elem);
				} else {
					el.addClass('js-fileapi-wrapper');
					if (el.attr('ng-file-generated-elem')) {
						if (el.parent().css('position') === '' || el.parent().css('position') === 'static') {
							el.parent().css('position', 'relative');
						}
						el.css('top', 0).css('bottom', 0).css('left', 0).css('right', 0).css('width', '100%').css('height', '100%').
							css('padding', 0).css('margin', 0);
						el.parent().unbind('click', el.parent().__afu_fileClickDelegate__);
					}
				}
			}
		}
	};
	var changeFnWrapper = function(fn) {
		return function(evt) {
			var files = FileAPI.getFiles(evt);
			//just a double check for #233
			for (var i = 0; i < files.length; i++) {
				if (files[i].size === undefined) files[i].size = 0;
				if (files[i].name === undefined) files[i].name = 'file';
				if (files[i].type === undefined) files[i].type = 'undefined';
			}
			if (!evt.target) {
				evt.target = {};
			}
			evt.target.files = files;
			// if evt.target.files is not writable use helper field
			if (evt.target.files != files) {
				evt.__files_ = files;
			}
			(evt.__files_ || evt.target.files).item = function(i) {
				return (evt.__files_ || evt.target.files)[i] || null;
			}
			if (fn) fn.apply(this, [evt]);
		};
	};
	var isFileChange = function(elem, e) {
		return (e.toLowerCase() === 'change' || e.toLowerCase() === 'onchange') && elem.getAttribute('type') == 'file';
	}
	if (HTMLInputElement.prototype.addEventListener) {
		HTMLInputElement.prototype.addEventListener = (function(origAddEventListener) {
			return function(e, fn, b, d) {
				if (isFileChange(this, e)) {
					addFlash(this);
					origAddEventListener.apply(this, [e, changeFnWrapper(fn), b, d]);
				} else {
					origAddEventListener.apply(this, [e, fn, b, d]);
				}
			}
		})(HTMLInputElement.prototype.addEventListener);
	}
	if (HTMLInputElement.prototype.attachEvent) {
		HTMLInputElement.prototype.attachEvent = (function(origAttachEvent) {
			return function(e, fn) {
				if (isFileChange(this, e)) {
					addFlash(this);
					if (window.jQuery) {
						// fix for #281 jQuery on IE8
						angular.element(this).bind('change', changeFnWrapper(null));
					} else {
						origAttachEvent.apply(this, [e, changeFnWrapper(fn)]);
					}
				} else {
					origAttachEvent.apply(this, [e, fn]);
				}
			}
		})(HTMLInputElement.prototype.attachEvent);
	}

	window.FormData = FormData = function() {
		return {
			append: function(key, val, name) {
				this.data.push({
					key: key,
					val: val,
					name: name
				});
			},
			data: [],
			__isFileAPIShim: true
		};
	};

	(function () {
		//load FileAPI
		if (!window.FileAPI) {
			window.FileAPI = {};
		}
		if (FileAPI.forceLoad) {
			FileAPI.html5 = false;
		}
		
		if (!FileAPI.upload) {
			var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
			if (window.FileAPI.jsUrl) {
				jsUrl = window.FileAPI.jsUrl;
			} else if (window.FileAPI.jsPath) {
				basePath = window.FileAPI.jsPath;
			} else {
				for (i = 0; i < allScripts.length; i++) {
					src = allScripts[i].src;
					index = src.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/)
					if (index > -1) {
						basePath = src.substring(0, index + 1);
						break;
					}
				}
			}

			if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
			script.setAttribute('src', jsUrl || basePath + 'FileAPI.js');
			document.getElementsByTagName('head')[0].appendChild(script);
			FileAPI.hasFlash = hasFlash();
		}
	})();
	FileAPI.disableFileInput = function(elem, disable) {
		if (disable) {
			elem.removeClass('js-fileapi-wrapper')
		} else {
			elem.addClass('js-fileapi-wrapper');
		}
	}
}


if (!window.FileReader) {
	window.FileReader = function() {
		var _this = this, loadStarted = false;
		this.listeners = {};
		this.addEventListener = function(type, fn) {
			_this.listeners[type] = _this.listeners[type] || [];
			_this.listeners[type].push(fn);
		};
		this.removeEventListener = function(type, fn) {
			_this.listeners[type] && _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
		};
		this.dispatchEvent = function(evt) {
			var list = _this.listeners[evt.type];
			if (list) {
				for (var i = 0; i < list.length; i++) {
					list[i].call(_this, evt);
				}
			}
		};
		this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

		var constructEvent = function(type, evt) {
			var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
			if (evt.result != null) e.target.result = evt.result;
			return e;
		};
		var listener = function(evt) {
			if (!loadStarted) {
				loadStarted = true;
				_this.onloadstart && this.onloadstart(constructEvent('loadstart', evt));
			}
			if (evt.type === 'load') {
				_this.onloadend && _this.onloadend(constructEvent('loadend', evt));
				var e = constructEvent('load', evt);
				_this.onload && _this.onload(e);
				_this.dispatchEvent(e);
			} else if (evt.type === 'progress') {
				var e = constructEvent('progress', evt);
				_this.onprogress && _this.onprogress(e);
				_this.dispatchEvent(e);
			} else {
				var e = constructEvent('error', evt);
				_this.onerror && _this.onerror(e);
				_this.dispatchEvent(e);
			}
		};
		this.readAsArrayBuffer = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsBinaryString = function(file) {
			FileAPI.readAsBinaryString(file, listener);
		}
		this.readAsDataURL = function(file) {
			FileAPI.readAsDataURL(file, listener);
		}
		this.readAsText = function(file) {
			FileAPI.readAsText(file, listener);
		}
	}
}
})();
