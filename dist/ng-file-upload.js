/**!
 * AngularJS file upload/drop directive and service with progress and abort
 * @author  Danial  <danial.farid@gmail.com>
 * @version 6.2.1
 */

if (window.XMLHttpRequest && !(window.FileAPI && FileAPI.shouldLoad)) {
  window.XMLHttpRequest.prototype.setRequestHeader = (function (orig) {
    return function (header, value) {
      if (header === '__setXHR_') {
        var val = value(this);
        // fix for angular < 1.2.0
        if (val instanceof Function) {
          val(this);
        }
      } else {
        orig.apply(this, arguments);
      }
    };
  })(window.XMLHttpRequest.prototype.setRequestHeader);
}

var ngFileUpload = angular.module('ngFileUpload', []);

ngFileUpload.version = '6.2.1';

ngFileUpload.service('UploadBase', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
  function sendHttp(config) {
    config.method = config.method || 'POST';
    config.headers = config.headers || {};

    var deferred = $q.defer();
    var promise = deferred.promise;

    config.headers.__setXHR_ = function () {
      return function (xhr) {
        if (!xhr) return;
        config.__XHR = xhr;
        if (config.xhrFn) config.xhrFn(xhr);
        xhr.upload.addEventListener('progress', function (e) {
          e.config = config;
          if (deferred.notify) {
            deferred.notify(e);
          } else if (promise.progressFunc) {
            $timeout(function () {
              promise.progressFunc(e);
            });
          }
        }, false);
        //fix for firefox not firing upload progress end, also IE8-9
        xhr.upload.addEventListener('load', function (e) {
          if (e.lengthComputable) {
            e.config = config;
            if (deferred.notify) {
              deferred.notify(e);
            } else if (promise.progressFunc) {
              $timeout(function () {
                promise.progressFunc(e);
              });
            }
          }
        }, false);
      };
    };

    $http(config).then(function (r) {
      deferred.resolve(r);
    }, function (e) {
      deferred.reject(e);
    }, function (n) {
      deferred.notify(n);
    });

    promise.success = function (fn) {
      promise.then(function (response) {
        fn(response.data, response.status, response.headers, config);
      });
      return promise;
    };

    promise.error = function (fn) {
      promise.then(null, function (response) {
        fn(response.data, response.status, response.headers, config);
      });
      return promise;
    };

    promise.progress = function (fn) {
      promise.progressFunc = fn;
      promise.then(null, null, function (update) {
        fn(update);
      });
      return promise;
    };
    promise.abort = function () {
      if (config.__XHR) {
        $timeout(function () {
          config.__XHR.abort();
        });
      }
      return promise;
    };
    promise.xhr = function (fn) {
      config.xhrFn = (function (origXhrFn) {
        return function () {
          if (origXhrFn) origXhrFn.apply(promise, arguments);
          fn.apply(promise, arguments);
        };
      })(config.xhrFn);
      return promise;
    };

    return promise;
  }

  this.upload = function (config) {
    function addFieldToFormData(formData, val, key) {
      if (val !== undefined) {
        if (angular.isDate(val)) {
          val = val.toISOString();
        }
        if (angular.isString(val)) {
          formData.append(key, val);
        } else if (config.sendFieldsAs === 'form') {
          if (angular.isObject(val)) {
            for (var k in val) {
              if (val.hasOwnProperty(k)) {
                addFieldToFormData(formData, val[k], key + '[' + k + ']');
              }
            }
          } else {
            formData.append(key, val);
          }
        } else {
          val = angular.isString(val) ? val : JSON.stringify(val);
          if (config.sendFieldsAs === 'json-blob') {
            formData.append(key, new Blob([val], {type: 'application/json'}));
          } else {
            formData.append(key, val);
          }
        }
      }
    }

    config.headers = config.headers || {};
    config.headers['Content-Type'] = undefined;
    config.transformRequest = config.transformRequest ?
      (angular.isArray(config.transformRequest) ?
        config.transformRequest : [config.transformRequest]) : [];
    config.transformRequest.push(function (data) {
      var formData = new FormData();
      var allFields = {};
      var key;
      for (key in config.fields) {
        if (config.fields.hasOwnProperty(key)) {
          allFields[key] = config.fields[key];
        }
      }
      if (data) allFields.data = data;
      for (key in allFields) {
        if (allFields.hasOwnProperty(key)) {
          var val = allFields[key];
          if (config.formDataAppender) {
            config.formDataAppender(formData, key, val);
          } else {
            addFieldToFormData(formData, val, key);
          }
        }
      }

      if (config.file != null) {
        var fileFormName = config.fileFormDataName || 'file';

        if (angular.isArray(config.file)) {
          var isFileFormNameString = angular.isString(fileFormName);
          for (var i = 0; i < config.file.length; i++) {
            formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i],
              (config.fileName && config.fileName[i]) || config.file[i].name);
          }
        } else {
          formData.append(fileFormName, config.file, config.fileName || config.file.name);
        }
      }
      return formData;
    });

    return sendHttp(config);
  };

  this.http = function (config) {
    config.transformRequest = config.transformRequest || function (data) {
        if ((window.ArrayBuffer && data instanceof window.ArrayBuffer) || data instanceof Blob) {
          return data;
        }
        return $http.defaults.transformRequest[0](arguments);
      };
    return sendHttp(config);
  };

  this.setDefaults = function(defaults) {
    this.defaults = defaults || {};
  };

  this.defaults = {};
  this.version = ngFileUpload.version;
}

]);

(function () {

  ngFileUpload.service('Upload', ['$parse', '$timeout', '$compile', 'UploadValidate',
    function ($parse, $timeout, $compile, UploadValidate) {
      var upload = UploadValidate;
      upload.getAttrWithDefaults = function (attr, name) {
        return attr[name] != null ? attr[name] :
          (upload.defaults[name] == null ?
            upload.defaults[name] : upload.defaults[name].toString());
      };

      upload.attrGetter = function (name, attr, scope, params) {
        if (scope) {
          if (params) {
            return $parse(this.getAttrWithDefaults(attr, name))(scope, params);
          } else {
            return $parse(this.getAttrWithDefaults(attr, name))(scope);
          }
        } else {
          return this.getAttrWithDefaults(attr, name);
        }
      };

      upload.updateModel = function (ngModel, attr, scope, fileChange, files, evt, noDelay) {
        function update() {
          var keep = upload.attrGetter('ngfKeep', attr, scope);
          if (keep === true) {
            var prevFiles = (ngModel.$modelValue || []).slice(0);
            if (!files || !files.length) {
              files = prevFiles;
            } else if (upload.attrGetter('ngfKeepDistinct', attr.scope) === true) {
              var len = prevFiles.length;
              for (var i = 0; i < files.length; i++) {
                for (var j = 0; j < len; j++) {
                  if (files[i].name === prevFiles[j].name) break;
                }
                if (j === len) {
                  prevFiles.push(files[i]);
                }
              }
              files = prevFiles;
            } else {
              files = prevFiles.concat(files);
            }
          }

          var file = files && files.length ? files[0] : null;
          if (ngModel) {
            var singleModel = !upload.attrGetter('ngfMultiple', attr, scope) && !upload.attrGetter('multiple', attr) && !keep;
            $timeout(function () {
              $parse(upload.attrGetter('ngModel', attr)).assign(scope, singleModel ? file : files);
            });
          }
          var ngfModel = upload.attrGetter('ngfModel', attr);
          if (ngfModel) {
            $parse(ngfModel).assign(scope, files);
          }

          if (fileChange) {
            $parse(fileChange)(scope, {
              $files: files,
              $file: file,
              $event: evt
            });
          }
        }

        if (noDelay) {
          update();
        } else {
          $timeout(function () {
            update();
          });
        }
      };

      return upload;
    }]);
})();

(function () {

  ngFileUpload.directive('ngfSelect', ['$parse', '$timeout', '$compile', 'Upload',
    function ($parse, $timeout, $compile, Upload) {
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
          linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile, Upload);
        }
      };
    }]);

  function linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile, upload) {
    /** @namespace attr.ngfSelect */
    /** @namespace attr.ngfChange */
    /** @namespace attr.ngModel */
    /** @namespace attr.ngModelRejected */
    /** @namespace attr.ngfModel */
    /** @namespace attr.ngfMultiple */
    /** @namespace attr.ngfCapture */
    /** @namespace attr.ngfAccept */
    /** @namespace attr.ngfValidate */
    /** @namespace attr.ngfDuration*/
    /** @namespace attr.ngfWidth*/
    /** @namespace attr.ngfHeight*/
    /** @namespace attr.ngfResetOnClick */
    /** @namespace attr.ngfResetModelOnClick */
    /** @namespace attr.ngfKeep */
    /** @namespace attr.ngfKeepDistinct */
    upload.registerValidators(ngModel, attr, scope);

    if (elem.attr('__ngf_gen__')) {
      return;
    }

    var attrGetter = function (name, scope) {
      return upload.attrGetter(name, attr, scope);
    };

    scope.$on('$destroy', function () {
      if (elem.$$ngfRefElem) elem.$$ngfRefElem.remove();
    });

    var disabled = false;

    attr.$observe('ngfSelect', function (value) {
      if (value === false) elem.attr('disabled', 'disabled');
      else if (value === true) elem.removeAttr('disabled');
    });

    function isInputTypeFile() {
      return elem[0].tagName.toLowerCase() === 'input' && attr.type && attr.type.toLowerCase() === 'file';
    }

    function fileChangeAttr() {
      return attrGetter('ngfChange') || attrGetter('ngfSelect');
    }

    function changeFn(evt) {
      var files = evt.__files_ || (evt.target && evt.target.files);
      elem.attr('__ngf_has_val_', true);
      //uploadService.validate(scope, $parse, attr, fileList, evt, function(files, rejFiles) {
      upload.updateModel(ngModel,  attr, scope, fileChangeAttr(), files, evt);
      if (files.length === 0) evt.target.value = files;
//                if (evt.target && evt.target.getAttribute('__ngf_gen__')) {
//                    angular.element(evt.target).remove();
//                }
//      });
    }

    function bindAttrToFileInput(fileElem) {
      if (attrGetter('ngfMultiple')) fileElem.attr('multiple', $parse(attrGetter('ngfMultiple'))(scope));
      if (attrGetter('ngfCapture')) fileElem.attr('capture', $parse(attrGetter('ngfCapture'))(scope));
      if (attrGetter('accept')) fileElem.attr('accept', attrGetter('accept'));
      for (var i = 0; i < elem[0].attributes.length; i++) {
        var attribute = elem[0].attributes[i];
        if ((isInputTypeFile() && attribute.name !== 'type') ||
          (attribute.name !== 'type' && attribute.name !== 'class' &&
          attribute.name !== 'id' && attribute.name !== 'style')) {
          if (attribute.value == null || attribute.value === '') {
            if (attribute.name === 'required') attribute.value = 'required';
            if (attribute.name === 'multiple') attribute.value = 'multiple';
          }
          fileElem.attr(attribute.name, attribute.value);
        }
      }
    }

    function createFileInput(evt, resetOnClick) {
      if (!resetOnClick && (evt || isInputTypeFile())) return elem.$$ngfRefElem || elem;
      if (elem.$$ngfProgramClick) return elem;

      var fileElem = angular.element('<input type="file">');
      bindAttrToFileInput(fileElem);

      if (isInputTypeFile()) {
        elem.replaceWith(fileElem);
        elem = fileElem;
        fileElem.attr('__ngf_gen__', true);
        $compile(elem)(scope);
      } else {
        fileElem.css('visibility', 'hidden').css('position', 'absolute').css('overflow', 'hidden')
          .css('width', '0px').css('height', '0px').css('border', 'none')
          .css('margin', '0px').css('padding', '0px').attr('tabindex', '-1');
        if (elem.$$ngfRefElem) {
          elem.$$ngfRefElem.remove();
        }
        elem.$$ngfRefElem = fileElem;
        document.body.appendChild(fileElem[0]);
      }

      return fileElem;
    }

    function resetModel(evt) {
      if (elem.attr('__ngf_has_val_')) {
        upload.updateModel(ngModel,  attr, scope, fileChangeAttr(), [], evt, true);
        elem.removeAttr('__ngf_has_val_');
      }
    }

    var initialTouchStartY = 0;

    function clickHandler(evt) {
      if (elem.attr('disabled') || disabled) return false;

      if (evt != null) {
        var touches = evt.changedTouches || (evt.originalEvent && evt.originalEvent.changedTouches);
        if (evt.type === 'touchstart') {
          initialTouchStartY = touches ? touches[0].clientY : 0;
          return true; // don't block event default
        } else {
          evt.stopPropagation();
          evt.preventDefault();

          // prevent scroll from triggering event
          if (evt.type === 'touchend') {
            var currentLocation = touches ? touches[0].clientY : 0;
            if (Math.abs(currentLocation - initialTouchStartY) > 20) return false;
          }
        }
      }

      var resetOnClick = attrGetter('ngfResetOnClick', scope) !== false;
      var fileElem = createFileInput(evt, resetOnClick);

      function clickAndAssign(evt) {
        if (evt && !elem.$$ngfProgramClick) {
          elem.$$ngfProgramClick = true;
          fileElem[0].click();
          $timeout(function () {
            delete elem.$$ngfProgramClick;
          }, 500);
        }
        if ((isInputTypeFile() || !evt) && resetOnClick) {
          elem.bind('click touchstart touchend', clickHandler);
        }
      }

      if (fileElem) {
        if (!evt || resetOnClick) fileElem.bind('change', changeFn);
        if (evt && resetOnClick && attrGetter('ngfResetModelOnClick', scope) !== false) {
          resetModel(evt);
        }

        // fix for android native browser < 4.4
        if (shouldClickLater(navigator.userAgent)) {
          setTimeout(function () {
            clickAndAssign(evt);
          }, 0);
        } else {
          clickAndAssign(evt);
        }
      }

      return false;
    }

    if (window.FileAPI && window.FileAPI.ngfFixIE) {
      window.FileAPI.ngfFixIE(elem, createFileInput, bindAttrToFileInput, changeFn);
    } else {
      clickHandler();
      //if (!isInputTypeFile()) {
      //  elem.bind('click touchend', clickHandler);
      //}
    }

    function shouldClickLater(ua) {
      // android below 4.4
      var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
      if (m && m.length > 2) {
        var v = upload.defaults.androidFixMinorVersion || 4;
        return parseInt(m[1]) < 4 || (parseInt(m[1]) === v && parseInt(m[2]) < v);
      }

      // safari on windows
      return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*/.test(ua);
    }
  }


})();

(function () {

  ngFileUpload.service('UploadDataUrl', ['UploadBase', '$timeout', '$q', function (UploadBase, $timeout, $q) {
    var promises = {}, upload = UploadBase;
    upload.dataUrl = function (file, disallowObjectUrl) {
      if (file.dataUrl) {
        var d = $q.defer();
        $timeout(function() {d.resolve(file.dataUrl);});
        return d.promise;
      }
      if (promises[file]) return promises[file];

      var deferred = $q.defer();
      $timeout(function () {
        if (window.FileReader && file &&
          (!window.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) &&
          (!window.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000)) {
          //prefer URL.createObjectURL for handling refrences to files of all sizes
          //since it doesn´t build a large string in memory
          var URL = window.URL || window.webkitURL;
          if (URL && URL.createObjectURL && !disallowObjectUrl) {
            var url;
            try {
              url = URL.createObjectURL(file);
            } catch (e) {
              deferred.reject();
              return;
            }
            if (url) deferred.resolve(url);
          } else {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function (e) {
              $timeout(function () {
                deferred.resolve(e.target.result);
              });
            };
            fileReader.onerror = function() {
              $timeout(function () {
                deferred.reject();
              });
            };
          }
        } else {
          deferred.reject();
        }
      });

      promises[file] = deferred.promise;
      promises[file].finally(function() {
        delete promises[file];
      });
      return promises[file];
    };
    return upload;
  }]);

  /** @namespace attr.ngfSrc */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfSrc', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        $timeout(function () {
          elem.attr('src', '{{(' + attr.ngfSrc + ') | ngfDataUrl' +
            ($parse(attr.ngfNoObjectUrl)(scope) === true ? ':true' : '') + '}}');
          attr.$set('ngfSrc', null);
          $compile(elem)(scope);
        });
      }
    };
  }]);

  /** @namespace attr.ngfBackground */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfBackground', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        $timeout(function () {
          elem.attr('style', elem.attr('style') + ';background-image:url(\'{{(' + attr.ngfBackground + ') | ngfDataUrl' +
            ($parse(attr.ngfNoObjectUrl)(scope) === true ? ':true' : '') + '}}\')');
          attr.$set('ngfBackground', null);
          $compile(elem)(scope);
        });
      }
    };
  }]);

  ngFileUpload.config(['$compileProvider', function ($compileProvider) {
    if ($compileProvider.imgSrcSanitizationWhitelist) $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|local|file|data|blob):/);
    if ($compileProvider.aHrefSanitizationWhitelist) $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|local|file|data|blob):/);
  }]);

  ngFileUpload.filter('ngfDataUrl', ['UploadDataUrl', '$sce', function (UploadDataUrl, $sce) {
    return function (file, disallowObjectUrl) {
      if (angular.isString(file)) {
        return $sce.trustAsResourceUrl(file);
      }
      if (file && !file.dataUrl) {
        if (file.dataUrl === undefined && angular.isObject(file)) {
          file.dataUrl = null;
          UploadDataUrl.dataUrl(file, function (url, file) {
            file.dataUrl = url;
          }, disallowObjectUrl);
        }
        return '';
      }
      return (file && file.dataUrl ? $sce.trustAsResourceUrl(file.dataUrl) : file) || '';
    };
  }]);

})();

(function () {
  function globStringToRegex(str) {
    if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
      return str.substring(1, str.length - 1);
    }
    var split = str.split(','), result = '';
    if (split.length > 1) {
      for (var i = 0; i < split.length; i++) {
        result += '(' + globStringToRegex(split[i]) + ')';
        if (i < split.length - 1) {
          result += '|';
        }
      }
    } else {
      if (str.indexOf('.') === 0) {
        str = '*' + str;
      }
      result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
      result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
    }
    return result;
  }

  function translateScalars(str) {
    if (angular.isString(str)) {
      if (str.search(/kb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1000);
      } else if (str.search(/mb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1000000);
      } else if (str.search(/gb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1000000000);
      } else if (str.search(/b/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1));
      } else if (str.search(/s/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1));
      } else if (str.search(/m/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1) * 60);
      } else if (str.search(/h/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1) * 3600);
      }
    }
    return str;
  }

  ngFileUpload.service('UploadValidate', ['UploadDataUrl', '$q', '$timeout', function (UploadDataUrl, $q, $timeout) {
    var upload = UploadDataUrl;
    upload.registerValidators = function (ngModel, attr, scope) {
      var attrGetter = function (name) {
        return upload.attrGetter(name, attr, scope);
      };

      function observeSync(name, validatorVal, fn) {
        attr.$observe('ngf' + name[0].toUpperCase() + name.substr(1), function () {
          registerSync(name, validatorVal, fn);
        });
        attr.$observe('ngfValidate', function () {
          registerSync(name, validatorVal, fn);
        });
      }

      function registerSync(name, validatorVal, fn) {
        var val = attrGetter('ngf' + name[0].toUpperCase() + name.substr(1)) ||
          validatorVal(attrGetter('ngfValidate') || {});
        if (val) {
          ngModel.$validators[name] = function (files) {
            var valid = true;
            if (files) {
              angular.forEach(files.length ? files : [files], function (file) {
                if (!fn(file, val)) {
                  file.$error = name;
                  file.$errorParam = val;
                  valid = false;
                  return false;
                }
              });
            }
            return valid;
          };
        }
      }

      upload.validatePattern = function (file, val) {
        var regexp = new RegExp(globStringToRegex(val), 'gi');
        return (file.type != null && regexp.test(file.type.toLowerCase())) ||
          (file.name != null && regexp.test(file.name.toLowerCase()));
      };

      observeSync('pattern', function (cons) {
        return cons.pattern;
      }, upload.validatePattern);
      observeSync('minSize', function (cons) {
        return cons.size && cons.size.min;
      }, function (file, val) {
        return file.size >= translateScalars(val);
      });
      observeSync('maxSize', function (cons) {
        return cons.size && cons.size.max;
      }, function (file, val) {
        return file.size <= translateScalars(val);
      });

      function observeAsync(name, validatorVal, type, asyncFn, fn) {
        attr.$observe('ngf' + name[0].toUpperCase() + name.substr(1), function () {
          registerAsync(name, validatorVal, type, asyncFn, fn);
        });
        attr.$observe('ngfValidate', function () {
          registerAsync(name, validatorVal, type, asyncFn, fn);
        });
      }

      function registerAsync(name, validatorVal, type, asyncFn, fn) {
        var val = attrGetter('ngf' + name[0].toUpperCase() + name.substr(1)) ||
          validatorVal(attrGetter('ngfValidate') || {});
        if (val) {
          ngModel.$asyncValidators[name] = function (files) {
            if (files) {
              var deferred = $q.defer(), validated = 0, hasError = false;
              files = files.length ? files : [files];
              angular.forEach(files, function (file) {
                if (file.type.search(type) !== 0) {
                  var d = $q.defer();
                  $timeout(function () {
                    d.resolve();
                  });
                  return d.promise;
                }
                asyncFn(file).then(function (d) {
                  if (!fn(d, val)) {
                    file.$error = name;
                    file.$errorParam = val;
                    hasError = true;
                  }
                }, function () {
                  file.$error = name;
                  file.$errorParam = val;
                  hasError = true;
                }).finally(function () {
                  validated++;
                  if (validated === files.length) {
                    if (hasError) deferred.reject(); else deferred.resolve();
                  }
                });
              });
              return deferred.promise;
            }
          };
        }
      }

      observeAsync('maxHeight', function (cons) {
        return cons.height && cons.height.max;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.height <= val;
      });
      observeAsync('minHeight', function (cons) {
        return cons.height && cons.height.min;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.height >= val;
      });
      observeAsync('maxWidth', function (cons) {
        return cons.height && cons.width.max;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.width <= val;
      });
      observeAsync('minWidth', function (cons) {
        return cons.height && cons.width.min;
      }, /image/, this.imageDimensions, function (d, val) {
        return d.width >= val;
      });
      observeAsync('maxDuration', function (cons) {
        return cons.height && cons.duration.max;
      }, /audio|video/, this.mediaDuration, function (d, val) {
        return d <= translateScalars(val);
      });
      observeAsync('minDuration', function (cons) {
        return cons.height && cons.duration.min;
      }, /audio|video/, this.mediaDuration, function (d, val) {
        return d >= translateScalars(val);
      });
    };

    var dimensionPromises = {}, durationPromises = {};
    upload.imageDimensions = function (file) {
      if (file.width && file.height) {
        var d = $q.defer();
        $timeout(function () {
          d.resolve({width: file.width, height: file.height});
        });
        return d.promise;
      }
      if (dimensionPromises[file]) return dimensionPromises[file];

      var deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('image') !== 0) {
          deferred.reject('not image');
          return;
        }
        upload.dataUrl(file).then(function (dataUrl) {
          var img = angular.element('<img>').attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');
          img.on('load', function () {
            var width = img[0].clientWidth;
            var height = img[0].clientHeight;
            img.remove();
            file.width = width;
            file.height = height;
            deferred.resolve({width: width, height: height});
          });
          img.on('error', function () {
            img.remove();
            deferred.reject('load error');
          });
          angular.element(document.body).append(img);
        }, function () {
          deferred.reject('load error');
        });
      });

      dimensionPromises[file] = deferred.promise;
      dimensionPromises[file].finally(function () {
        delete dimensionPromises[file];
      });
      return dimensionPromises[file];
    };

    upload.mediaDuration = function (file) {
      if (file.duration) {
        var d = $q.defer();
        $timeout(function () {
          d.resolve(file.duration);
        });
        return d.promise;
      }
      if (durationPromises[file]) return durationPromises[file];

      var deferred = $q.defer();
      $timeout(function () {
        if (file.type.indexOf('audio') === 0 || file.type.indexOf('video') === 0) {
          deferred.reject('not image');
          return;
        }
        upload.dataUrl(file).then(function (dataUrl) {
          var el = angular.element(file.type.indexOf('audio') === 0 ? '<audio>' : '<video>')
            .attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');

          el.on('loadedmetadata', function () {
            var duration = el[0].duration;
            file.duration = duration;
            el.remove();
            deferred.resolve(duration);
          });
          el.on('error', function () {
            el.remove();
            deferred.reject('load error');
          });
          angular.element(document.body).append(el);
        }, function () {
          deferred.reject('load error');
        });
      });

      durationPromises[file] = deferred.promise;
      durationPromises[file].finally(function () {
        delete durationPromises[file];
      });
      return durationPromises[file];
    };
    return upload;
  }]);
})();

(function () {
  ngFileUpload.directive('ngfDrop', ['$parse', '$timeout', '$location', 'Upload',
    function ($parse, $timeout, $location, Upload) {
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
          linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location, Upload);
        }
      };
    }]);

  ngFileUpload.directive('ngfNoFileDrop', function () {
    return function (scope, elem) {
      if (dropAvailable()) elem.css('display', 'none');
    };
  });

  ngFileUpload.directive('ngfDropAvailable', ['$parse', '$timeout', 'Upload', function ($parse, $timeout, Upload) {
    return function (scope, elem, attr) {
      if (dropAvailable()) {
        var model = $parse(Upload.attrGetter('ngfDropAvailable', attr));
        $timeout(function () {
          model(scope);
          if (model.assign) {
            model.assign(scope, true);
          }
        });
      }
    };
  }]);

  function linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location, upload) {
    var available = dropAvailable();

    var attrGetter = function (name, scope, params) {
      return upload.attrGetter(name, attr, scope, params);
    };

    if (attrGetter('dropAvailable')) {
      $timeout(function () {
        if (scope[attrGetter('dropAvailable')]) {
          scope[attrGetter('dropAvailable')].value = available;
        } else {
          scope[attrGetter('dropAvailable')] = available;
        }
      });
    }
    if (!available) {
      if (attrGetter('ngfHideOnDropNotAvailable', scope) === true) {
        elem.css('display', 'none');
      }
      return;
    }

    upload.registerValidators(ngModel, attr, scope);

    var disabled = false;
    attr.$observe('ngfDrop', function(value) {
      if (value === false) elem.attr('disabled', 'disabled');
      else if (value === true) elem.removeAttr('disabled');
    });

    var leaveTimeout = null;
    var stopPropagation = attrGetter('ngfStopPropagation', scope);
    var dragOverDelay = 1;
    var actualDragOverClass;

    elem[0].addEventListener('dragover', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
      // handling dragover events from the Chrome download bar
      if (navigator.userAgent.indexOf('Chrome') > -1) {
        var b = evt.dataTransfer.effectAllowed;
        evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
      }
      $timeout.cancel(leaveTimeout);
      if (!actualDragOverClass) {
        actualDragOverClass = 'C';
        calculateDragOverClass(scope, attr, evt, function (clazz) {
          actualDragOverClass = clazz;
          elem.addClass(actualDragOverClass);
        });
      }
    }, false);
    elem[0].addEventListener('dragenter', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
    }, false);
    elem[0].addEventListener('dragleave', function () {
      if (elem.attr('disabled') || disabled) return;
      leaveTimeout = $timeout(function () {
        elem.removeClass(actualDragOverClass);
        actualDragOverClass = null;
      }, dragOverDelay || 1);
    }, false);
    elem[0].addEventListener('drop', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
      elem.removeClass(actualDragOverClass);
      actualDragOverClass = null;
      extractFiles(evt, function (files) {
          upload.updateModel(ngModel, attr, scope, attrGetter('ngfChange') || attrGetter('ngfDrop'), files, evt);
        }, attrGetter('ngfAllowDir', scope) !== false,
        attrGetter('multiple') || attrGetter('ngfMultiple', scope));
    }, false);
    elem[0].addEventListener('paste', function (evt) {
      if (elem.attr('disabled') || disabled) return;
      var files = [];
      var clipboard = evt.clipboardData || evt.originalEvent.clipboardData;
      if (clipboard && clipboard.items) {
        for (var k = 0; k < clipboard.items.length; k++) {
          if (clipboard.items[k].type.indexOf('image') !== -1) {
            files.push(clipboard.items[k].getAsFile());
          }
        }
        upload.updateModel(ngModel, attr, scope, attrGetter('ngfChange') || attrGetter('ngfDrop'), files, evt);
      }
    }, false);

    function calculateDragOverClass(scope, attr, evt, callback) {
      var clazz = attrGetter('ngfDragOverClass', scope, {$event: evt});
      if (clazz) {
        if (clazz.delay) dragOverDelay = clazz.delay;
        if (clazz.accept || clazz.reject) {
          var items = evt.dataTransfer.items, files = [];
          if (items != null) {
            var pattern;
            for (var i = 0; i < items.length; i++) {
              if (items[i].kind === 'file' || items[i].kind === '') {
                files.push();
                pattern = pattern || attrGetter('ngfPattern', scope, {$event: evt});
                if (!upload.validatePattern(items[i], pattern)) {
                  clazz = clazz.reject;
                  break;
                }
              }
            }
            clazz = clazz.accept;
          }
        }
      }
      callback(clazz || attrGetter('ngfDragOverClass') || 'dragover');
    }

    function extractFiles(evt, callback, allowDir, multiple) {
      var files = [], processing = 0;

      function traverseFileTree(files, entry, path) {
        if (entry != null) {
          if (entry.isDirectory) {
            var filePath = (path || '') + entry.name;
            files.push({name: entry.name, type: 'directory', path: filePath});
            var dirReader = entry.createReader();
            var entries = [];
            processing++;
            var readEntries = function () {
              dirReader.readEntries(function (results) {
                try {
                  if (!results.length) {
                    for (var i = 0; i < entries.length; i++) {
                      traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/');
                    }
                    processing--;
                  } else {
                    entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                    readEntries();
                  }
                } catch (e) {
                  processing--;
                  console.error(e);
                }
              }, function () {
                processing--;
              });
            };
            readEntries();
          } else {
            processing++;
            entry.file(function (file) {
              try {
                processing--;
                file.path = (path ? path : '') + file.name;
                files.push(file);
              } catch (e) {
                processing--;
                console.error(e);
              }
            }, function () {
              processing--;
            });
          }
        }
      }

      var items = evt.dataTransfer.items;

      if (items && items.length > 0 && $location.protocol() !== 'file') {
        for (var i = 0; i < items.length; i++) {
          if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
            var entry = items[i].webkitGetAsEntry();
            if (entry.isDirectory && !allowDir) {
              continue;
            }
            if (entry != null) {
              traverseFileTree(files, entry);
            }
          } else {
            var f = items[i].getAsFile();
            if (f != null) files.push(f);
          }
          if (!multiple && files.length > 0) break;
        }
      } else {
        var fileList = evt.dataTransfer.files;
        if (fileList != null) {
          for (var j = 0; j < fileList.length; j++) {
            files.push(fileList.item(j));
            if (!multiple && files.length > 0) {
              break;
            }
          }
        }
      }
      var delays = 0;
      (function waitForProcess(delay) {
        $timeout(function () {
          if (!processing) {
            if (!multiple && files.length > 1) {
              i = 0;
              while (files[i].type === 'directory') i++;
              files = [files[i]];
            }
            callback(files);
          } else {
            if (delays++ * 10 < 20 * 1000) {
              waitForProcess(10);
            }
          }
        }, delay || 0);
      })();
    }
  }

  function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div);
  }

})();
