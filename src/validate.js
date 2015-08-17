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
